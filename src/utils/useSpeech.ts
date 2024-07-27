import * as sdk from "microsoft-cognitiveservices-speech-sdk"
import { PassThrough } from "stream"

// replace with your own subscription key,
// service region (e.g., "westus"), and
// the name of the file you save the synthesized audio.
const subscriptionKey = process.env.SUBSCRIPTION_KEY!
const serviceRegion = process.env.SERVICEREGION!

// now create the audio-config pointing to our stream and
// the speech config specifying the language.
const speechConfig = sdk.SpeechConfig.fromSubscription(
  subscriptionKey,
  serviceRegion
)
speechConfig.speechSynthesisOutputFormat = 5

// create the speech synthesizer.

export async function textToSpeech(voice: string, text: string): Promise<any> {
  speechConfig.speechSynthesisVoiceName = voice
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig)
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
