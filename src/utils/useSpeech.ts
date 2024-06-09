import * as sdk from "microsoft-cognitiveservices-speech-sdk"
import { PassThrough } from "stream"

// replace with your own subscription key,
// service region (e.g., "westus"), and
// the name of the file you save the synthesized audio.
var subscriptionKey = process.env.SUBSCRIPTION_KEY!
var serviceRegion = process.env.SERVICEREGION!
var filename = "Speech.mp3"

// now create the audio-config pointing to our stream and
// the speech config specifying the language.
const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename)
const speechConfig = sdk.SpeechConfig.fromSubscription(
  subscriptionKey,
  serviceRegion
)
speechConfig.speechSynthesisOutputFormat = 5
speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoxiaoNeural"

// create the speech synthesizer.
const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

export async function textToSpeech(text: string): Promise<any> {
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        const { audioData } = result
        const bufferStream = new PassThrough()
        bufferStream.end(Buffer.from(audioData))
        resolve(bufferStream)
      },
      (error) => {
        synthesizer.close()
        reject(error)
      }
    )
  })
}

// hello world
