# Amallo
Amallo is a thin wrapper for the [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md). There is an [official wrapper](https://github.com/ollama/ollama-js) that is ~~probably~~ definitely more robust.  This is a single JS file that works in the Browser, Node, Deno, and Bun and has ergonomics I particularly like. It is current as of Ollama [v0.5.7](https://github.com/ollama/ollama/releases/tag/v0.5.7).


### Installation

```js
// if you just cloned the repo and copied the file
import Amallo from './amallo.mjs'
```
```js
// if you got it via `npm install amallo` or similar
import Amallo from 'amallo'
```
```html
<!-- if you want to use it in the browser -->
<script type="module" src="amallo.mjs"></script>
```
```html
<!-- or just importing it the esm way also works -->
<script>
import Amallo from 'amallo'
</script>
```

You also need an ollama running somewhere accessible. It should be available on localhost by default. If you have a more complicated usecase check the [FAQ](docs/faq.md), you may need to set some envvars (`OLLAMA_HOST="0.0.0.0"` and/or `OLLAMA_ORIGINS="*"`). Don't blindly do this but it'll save you some googling if you end up having CORS/external accessibility issues.

### Basic Usage
Amallo is a closure that keeps some state for convenience and returns an object that has properties for the common API endpoints. Instantiate it like this, both parameters are optional.
```js
//url defaults to 'http://localhost:11434
//model defaults to 'deepseek-r1:1.5b'
const amallo = Amallo(model, url)
```
By default Amallo defaults to a streaming+promise combo API.
```js
let generation = amallo.generate('Can you please tell me a joke?')
```
You can also just send a request object as detailed by the Ollama API docs (but model is optional, defaults to whatever you set when you instantiated the closure)
```js
let generation = amallo.generate({prompt: 'Can you please tell me a joke?'})
```
Once the request is in flight you can set the `ontoken` property to a callback that will be fired every time there's a new token.
```js
generation.ontoken = token => process.stdout.write(token)
```
Or you can simply await the response.
```js
let generated = await generation
console.log(generated.response)
```

```html
> <think>
  Okay, so I need to tell a funny joke ...
```
If you change your mind before a request finishes, it's possible to abort it, ollama will cancel inference in response.
```js
generation.abort()
```

### Interface

You may freely get/set the instance `url` and `model` post instantiation.
```js
amallo.url = 'https://ollama.runninginthe.cloud:1337'
amallo.model = 'MidnightMiqu70b:iq3_xxs'
```
All methods default to a streaming request if possible, `stream` must manually be set to `false` in the request to avoid this behavior. You can set `.onchunk` if you want to process the raw response chunks as they come in, `.ontoken` for token strings.
##### [`.generate( prompt_string | request_object )`](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-completion)
```js
const generation = amallo.generate({prompt: 'Can you please tell me a joke?'})
let response = ''
generation.ontoken = token => response += token
const generated = await generation
generate.response === response
> true
console.log(generated.response)
> `Why did the chicken cross the road?
...`
```
##### [`.chat( request_object )`](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion)
```js
const generated = await amallo.chat({messages: [{role:'user', content:'Can you please tell me a joke?'}]})
console.log(generated.messages.at(-1))
> {
  role: 'assistant',
  response: 'Why did the tomato turn red? ...'
}
```
##### [`.tags() also available as .ls()`](https://github.com/ollama/ollama/blob/main/docs/api.md#list-local-models)
Returns an array of models currently available.
##### [`.ps()`](https://github.com/ollama/ollama/blob/main/docs/api.md#list-running-models)
Returns an array of models currently running.
##### [`.show( model_name_string | request_object )`](https://github.com/ollama/ollama/blob/main/docs/api.md#show-model-information)
Shows the model info, specifying the model is optional, and if omitted it returns the info for the instance model.
##### [`.stop( model_name_string | request_object )`](https://github.com/ollama/ollama/blob/main/README.md#stop-a-model-which-is-currently-running)
This isn't an official API endpoint, but it's a wrapper that works the exact same way as `ollama stop modelname` when using the CLI. 
Like `.show()` the model is optional, if omitted the instance model is stopped.
n.b. This will return *before* the model is fully unloaded, the latency isn't large but it's something to beware of.
```js
await amallo.stop('llama3.2:latest')
```
##### [`.version()`](https://github.com/ollama/ollama/blob/main/docs/api.md#version)
```js
await amallo.version()
> '0.5.7'
```
##### [`.embed( string_to_embed | array_of_strings | request_object )`](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings)
Generate embeddings for a text or list of texts. 

#### Additional Methods
I haven't ever needed to use these methods so I haven't bothered to test them. Since this just wraps the relevant API endpoints in a very transparent way all of these probably work fine.
##### [`.copy()`](https://github.com/ollama/ollama/blob/main/docs/api.md#copy-a-model)
##### [`.delete()`](https://github.com/ollama/ollama/blob/main/docs/api.md#delete-a-model)
##### [`.create()`](https://github.com/ollama/ollama/blob/main/docs/api.md#create-a-model)
##### [`.pull()`](https://github.com/ollama/ollama/blob/main/docs/api.md#pull-a-model)
##### [`.push()`](https://github.com/ollama/ollama/blob/main/docs/api.md#push-a-model)



