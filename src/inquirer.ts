import inquirer, { DistinctQuestion } from 'inquirer';

const DEFAULT_PROMPT: DistinctQuestion = {
  type: 'input',
  name: `question_${Date.now()}`,
  message: '',
};

export default function questionUser(question: DistinctQuestion) {
  return inquirer.prompt([{ ...DEFAULT_PROMPT, ...question }]).then(answers => {
    switch (question.type) {
      case 'input':
      case 'list':
        return answers[question.name as string];
      case 'checkbox':
        return answers;
      default:
        return answers;
    }
  });
}
