import fs from 'node:fs'
import Amallo from "../amallo.mjs"

const ollama = Amallo('moondream')
const pass_fail = (pass, start, name) => {
  const time = new Date()-start
  console.log(`${name} : pass (${time.toFixed(1)}ms)`)
  return {pass, name, time}
}

const tests = [
  (
    start=new Date(),
    name="url/model getter/setter"
  ) => {
    const url = ollama.url
    const model = ollama.model
    if (
      (ollama.model === 'boon bean'?ollama.model = model:false) 
      && ollama.url === 'http://localhost:11434'
    ) {
      return pass_fail(true,start,name)
    } else {
      return pass_fail(false,start,name)
    }
  },
  (
    start=new Date(),
    name="streaming generation"
  ) => ollama.generate({
    prompt: 'Please tell me a joke?',
    options: {
      seed: 666,
    }
  }).then(completed => {
    if (completed.response === 
      '\nWhy did the tomato turn red? Because it saw the salad dressing!'
      && completed.chunks[0].model === 'moondream'
      && completed.chunks[0].done === false
    ) {
      return pass_fail(true,start,name)
    } else {
      return pass_fail(false,start,name)
    }
  }),
  (
    start=new Date(),
    name="image in a chat"
  ) => ollama.chat({messages: [{
    role: "user",
    content: 'Can you describe the image?',
    images: [fs.readFileSync('./tests/goldhill.png').toString('base64')],
  }
  ],

    options: {
      seed: 5555,
    }
  }).then(completed => {
    if (completed.message.content === 
      `The image depicts a picturesque village with several old, small houses situated on a steep hill. The houses are closely packed together and have thatched roofs, giving them a quaint appearance. A person can be seen walking up the hill in front of one of these houses. The scene is further enhanced by the presence of trees scattered throughout the area, adding to the charm of the village.\n\nThe image also features a few cars parked on the side of the road near the houses, indicating that visitors or locals may have driven up to this scenic location for sightseeing or other purposes.`
    ) {
      return pass_fail(true,start,name)
    } else {
      return pass_fail(false,start,name)
    }
  }),
  async (
    start=new Date(),
    name="ps"
  ) => {
    const running_models = await ollama.ps()
    const moonbeam_running = running_models.filter(a => a.name === 'moondream:latest').length === 1
    const stop_moondream = await ollama.stop('moondream:latest')
    //unloading the model takes nonzero time and i don't wanna poll for it so
    //we just wait, this could fail in the future and need to be fixed
    await new Promise(r => setTimeout(r,500))
    const running_models_after_stop = await ollama.ps()
    const moonbeam_running_after_stop = running_models.filter(a => a.name === 'moondream:latest').length === 1
    if (
      moonbeam_running && !moonbeam_running_after_stop
    ) {
      return pass_fail(true,start,name)
    } else {
      return pass_fail(false,start,name)
    }
  },
]

const done_tests = []

for (const test of tests) {
  let done = await test()
  done_tests.push(done)
}
