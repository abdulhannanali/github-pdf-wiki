const nodegit = require("nodegit")
const markdownpdf = require("markdown-pdf")
const fs = require("fs")
const path = require("path")
const url = require("url")

const contentGenerator = require("./contentsPageGenerator")

function repoSpace() {
	if (!fs.existsSync("./repos")) {
		fs.mkdirSync("./repos")
	}

	if (!fs.existsSync("./pdfs")) {
		fs.mkdirSync("./pdfs")
	}
}

function init(link) {
	var repoName = Math.random().toString(36).substr(2)

	repoSpace()
	contentGenerator(link, function (error, contents, cloneUrl) {
		if (!error) {
			fetchRepo(cloneUrl, repoName)
				.then(function (repo) {
					generateMarkdown(contents, repoName, function () {

					})
				})
		}
	})
}

function generateMarkdown(contents, repoName, cb) {
	var relativeDirectory = "./repos/" + repoName
	var pdfPath = "./pdfs/" + repoName + ".pdf"
	var files = fs.readdirSync(relativeDirectory)

	var filesArray = []


	contents.forEach(function (file) {
		var found = false
		var filePath = url.parse(file.link).pathname
		var fileBase = relativeDirectory + "/" + path.basename(filePath) + ".md"


		files.forEach(function (file1) {
			if (file1 == path.basename(fileBase)) {
				found = true
			}

		})

		if (found) {
			filesArray.push(fileBase)			
		}

	})

	var homeFile = hasHome(files)

	if (hasHome(files)) {
		filesArray.unshift(relativeDirectory + "/" + homeFile)
	}

	filesArray.push("./markdowns/credits.md")

	markdownpdf().concat.from(filesArray)
		.to(pdfPath, function (filename) {
			cb(filename)
		})
}


// checks if the repo has the home file the home
function hasHome(files) {
	var found = false
	files.forEach(function (file) {
		if (file.toLowerCase() == "home.md") {
			found = file
		}
	})

	return found
}


function fetchRepo(cloneUrl, repoName) {
	return nodegit.Clone(cloneUrl, "./repos/" + repoName)
}

// Parses the link to give the github wiki link and repo url
function linkParsing(link) {

}


module.exports = init 



