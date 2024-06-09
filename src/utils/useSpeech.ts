import * as sdk from "microsoft-cognitiveservices-speech-sdk"
import { PassThrough } from "stream"

// replace with your own subscription key,
// service region (e.g., "westus"), and
// the name of the file you save the synthesized audio.
var subscriptionKey = process.env.SUBSCRIPTION_KEY!
var serviceRegion = process.env.SERVICEREGION!
var filename = "YourAudioFile.wav"

// now create the audio-config pointing to our stream and
// the speech config specifying the language.
const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename)
const speechConfig = sdk.SpeechConfig.fromSubscription(
  subscriptionKey,
  serviceRegion
)
speechConfig.speechSynthesisOutputFormat = 5

// create the speech synthesizer.
const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

export async function textToSpeech(text: string): Promise<any> {
  try {
    const speech = synthesizer.speakTextAsync(
      text,
      (result) => {
        const { audioData } = result

        synthesizer.close()

        // return stream from memory
        const bufferStream = new PassThrough()
        bufferStream.end(Buffer.from(audioData))
        console.log(bufferStream)
        return bufferStream
      },
      (error) => {
        synthesizer.close()
        console.log(error)
      }
    )
    return speech
  } catch (error: any) {
    console.log("error:", error)
    return "undefined"
  }
}

// hello world
