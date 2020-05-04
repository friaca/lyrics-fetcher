import inquirer, { DistinctQuestion } from 'inquirer';

const DEFAULT_PROMPT: DistinctQuestion = {
  type: 'input',
  name: `question_${Date.now()}`,
  message: '',
};

export default function questionUser(
  question: DistinctQuestion
): Promise<string | { [k: string]: string }> {
  return inquirer.prompt([{ ...DEFAULT_PROMPT, ...question }]).then(dirtyAnswers => {
    switch (question.type) {
      case 'input':
      case 'list':
        return dirtyAnswers[question.name as string];
      case 'checkbox':
        return dirtyAnswers;
      default:
        return dirtyAnswers;
    }
  });
}
