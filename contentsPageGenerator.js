const fs = require("fs")
const request = require("request")
const cheerio = require("cheerio")
const url = require("url")

const useragentString = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1"

module.exports = function (link, cb) {
	var parsedUrl = url.parse(link)
	var requestOption = {
		url: link,
		headers: {
			"User-Agent": useragentString
		}
	}

	if (isWiki(parsedUrl)) {
		request(requestOption, function (error, response, body) {
			if (error) {
				cb(error)
			}
			else {
				var $ = cheerio.load(response.body)
				if (checkWikiContents($)) {
					cb(error, wikiContentsArray($, link), cloneUrl($))
				} else {
					cb(new Error("Not a Wiki!"))
				}
			}
		})
	}

	cb(new Error("This is not a valid github wiki url"))
}

function checkWikiContents($) {
	return $(".wiki-auxiliary-content").contents().length > 0 &&
		   $(".wiki-pages").contents().length
}

function wikiContentsArray($, baseLink) {
	var wikiContents = $(".wiki-page-link").map(function (index, element) {
		return {
			text: $(this).text(),
			link: url.resolve(baseLink, $(this).attr("href"))
		}
	}).get()

	return wikiContents
}

// Fetches the cloning link from the github repo
function cloneUrl($) {
	return ($(".clone-url")
		.find("input").attr("value"))
}

function isWiki(parsedUrl) {
	var splitPath = parsedUrl.pathname.split("/")
	var wiki = splitPath.pop()

	if (wiki == "/wiki" ||
		wiki == "/wiki/" ||
		wiki == "wiki/"||
		wiki == "wiki") {
		return true
	}

	return false
}