import inquirer, { DistinctQuestion } from 'inquirer';

const DEFAULT_PROMPT: DistinctQuestion = {
  type: 'input',
  name: `question_${Date.now()}`,
  message: '',
};

export default function questionUser(question: DistinctQuestion): Promise<{ [k: string]: string }> {
  return inquirer.prompt([{ ...DEFAULT_PROMPT, ...question }])
}
