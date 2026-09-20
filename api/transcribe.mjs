import { handleTranscription } from '../scripts/transcription-proxy.mjs';

export default function handler(req,res){return handleTranscription(req,res);}
