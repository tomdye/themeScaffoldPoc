const { prompt } = require('inquirer');
const fs = require('fs');
const { join, basename, extname } = require('path');
const globby = require('globby');

const packages = [];
const packageQuestions = [
	{
		type: 'input',
		name: 'package',
		message: "What Package to do you want to theme?"
	},
	{
		type: 'confirm',
		name: 'askAgain',
		message: 'Any more?',
		default: true
	}
];

function getFileQuestions(packageName, files) {
	const ext = '.m.css.d.ts';
	return [
		{
			type: 'checkbox',
			message: `Which of the ${packageName} theme files would you like to scaffold?`,
			name: 'files',
			choices: files.map(name => {
				return {
					name: basename(name).split(ext)[0],
					value: name
				};
			})
		}
	];
}


function askForPackageName() {
	prompt(packageQuestions).then(answers => {
		packages.push(answers.package);
		if (answers.askAgain) {
			askForPackageName();
		} else {
			scaffoldTheme();
		}
	});
}

function scaffoldTheme() {
	packages.forEach(package => scaffoldPackage(package));
};

function scaffoldPackage(package) {
	const path = join('./node_modules', package, 'theme');
	const ext = '.m.css.d.ts';
	const exists = fs.existsSync(path);

	if (!exists) {
		console.log(`cannot find ${path}`);
		return;
	} else {
		const files = globby.sync(join(path, `**/*${ext}`));

		const fileQuestions = getFileQuestions(package, files);

		prompt(fileQuestions).then(answers => {
			answers.files.forEach(filePath => {
				const fileName = basename(filePath).split(ext)[0];
				const themeKey = `${package}/${fileName}`;
				const file = fs.readFileSync(filePath, 'utf8');
				const output = file.replace(/export const /g, '.').replace(/: string;/g, ' {}');
				console.log(`themekey: ${themeKey}`);
				console.log(`scaffolded CSS:\n\n${output}\n`);
			});
		});
	}
}

askForPackageName();
