// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


	let disposable = vscode.commands.registerTextEditorCommand('fluttercomments.comments', function () {
		comments();
	});
	context.subscriptions.push(disposable);
}

function comments() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		let pathArray = editor.document.uri.path.split('.')
		if (pathArray[pathArray.length - 1] !== 'dart') {
			return;
		}
		let comments = functionComments(editor)
		const activeLine = editor.selection.active.line
		let positoin = new vscode.Position(activeLine, 0)
		editor.edit((editBuilder) => {
			editBuilder.replace(positoin, comments);
		});
	}
}

function functionComments(editor) {
	const document = editor.document
	const activeLine = editor.selection.active.line


	let returnValue = ''
	let funcNameValue = ''
	let requireParamsValue = []
	let optionalParamsValue = []

	let startLine = activeLine
	while (document.lineAt(startLine).isEmptyOrWhitespace) {
		startLine += 1
	}

	let endLine = startLine
	let funcStr = document.lineAt(endLine).text
	while (!document.lineAt(endLine).text.includes(')')) {
		endLine += 1
		funcStr += document.lineAt(endLine).text
	}
	funcStr = funcStr.replaceAll('\t', '')
	funcStr = funcStr.replaceAll('\n', '')
	funcStr = funcStr.replaceAll('\r', '')
	funcStr = funcStr.replaceAll('  ', '')
	funcStr = funcStr.replaceAll('    ', '')
	funcStr = funcStr.replaceAll('    ', '')
	funcStr = funcStr.replaceAll(', ', ',')
	funcStr = funcStr.replaceAll(',\n', ',')
	funcStr = funcStr.replaceAll(',\t', ',')
	let allArray = funcStr.split("(") || []
	if (allArray.length >= 1) {
		/// 函数前部
		let returnStr = allArray[0]
		let returnArray = returnStr.split(' ')
		let returnArrayRe = returnArray.reverse()
		/// returnArray[0] 函数名
		funcNameValue = returnArray[0]
		if (returnArrayRe.length >= 2) {
			for (var i = 1; i < returnArrayRe.length; i++) {
				let tmp = returnArrayRe[i]
				if (tmp !== '') {
					/// tmp 函数返回值
					returnValue = tmp
					break
				}
			}
		}
		/// 函数参数部分
		let paramStrA = allArray[1].split(')')
		if (paramStrA.length >= 2) {
			let paramStr = paramStrA[0]
			paramStr = paramStr.replaceAll(',}', '')
			let paramsSplit = paramStr.split('{')
			let requireParamsStr = paramsSplit[0]
			requireParamsValue = requireParamsStr.split(',')
			// 移除空字符串
			if (requireParamsValue.length >= 1 && requireParamsValue[requireParamsValue.length - 1] === '') {
				requireParamsValue.pop()
			}
			if (paramsSplit.length >= 2) {
				let optionAlParamsStr = paramsSplit[1]
				optionalParamsValue = optionAlParamsStr.split(',')
				if (optionalParamsValue.length >= 1 && optionalParamsValue[optionalParamsValue.length - 1] === '') {
					optionalParamsValue.pop()
				}
			}
		}
		let prefix = '\n\t///\t'
		let requireParamsComments = `${prefix}---- Required params ----${prefix}`
		requireParamsValue.forEach(element => {
			requireParamsComments += `${prefix}${element}${prefix}`
		});

		let optionalParamsComments = `${prefix}---- Optional params ----${prefix}`
		optionalParamsValue.forEach(element => {
			optionalParamsComments += `${prefix}${element}${prefix}`
		});

		return `${prefix}${prefix}---- Return Value ----${prefix}${prefix}${returnValue}${prefix}${prefix}---- Function Name ----${prefix}${prefix}${funcNameValue}${prefix}${requireParamsComments}${optionalParamsComments}`
	} else {
		return '';
	}

}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
