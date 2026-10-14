import { handleExerciseVideoAnalysis } from '../scripts/exercise-video-analysis.mjs';

export default function handler(req,res){
  return handleExerciseVideoAnalysis(req,res);
}
