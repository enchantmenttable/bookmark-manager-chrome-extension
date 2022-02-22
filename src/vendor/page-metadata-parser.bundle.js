var metadataparser =
/******/ (function (modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if (installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
				/******/
			};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
			/******/
		}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
		/******/
	})
/************************************************************************/
/******/([
/* 0 */
/***/ (function (module, exports, __webpack_require__) {

			module.exports = __webpack_require__(1);


			/***/
		}),
/* 1 */
/***/ (function (module, exports, __webpack_require__) {

			const { makeUrlAbsolute, parseUrl } = __webpack_require__(2);

			function getProvider(host) {
				return host
					.replace(/www[a-zA-Z0-9]*\./, '')
					.replace('.co.', '.')
					.split('.')
					.slice(0, -1)
					.join(' ');
			}

			function buildRuleSet(ruleSet) {
				return (doc, context) => {
					let maxScore = 0;
					let maxValue;

					for (let currRule = 0; currRule < ruleSet.rules.length; currRule++) {
						const [query, handler] = ruleSet.rules[currRule];

						const elements = Array.from(doc.querySelectorAll(query));

						if (elements.length) {
							for (const element of elements) {
								let score = ruleSet.rules.length - currRule;

								if (ruleSet.scorers) {
									for (const scorer of ruleSet.scorers) {
										const newScore = scorer(element, score);

										if (newScore) {
											score = newScore;
										}
									}
								}

								if (score > maxScore) {
									maxScore = score;
									maxValue = handler(element);
								}
							}
						}
					}

					if (!maxValue && ruleSet.defaultValue) {
						maxValue = ruleSet.defaultValue(context);
					}

					if (maxValue) {
						if (ruleSet.processors) {
							for (const processor of ruleSet.processors) {
								maxValue = processor(maxValue, context);
							}
						}

						if (maxValue.trim) {
							maxValue = maxValue.trim();
						}

						return maxValue;
					}
				};
			}

			const metadataRuleSets = {
				description: {
					rules: [
						['meta[property="og:description"]', element => element.getAttribute('content')],
						['meta[name="description" i]', element => element.getAttribute('content')],
					],
				},

				icon: {
					rules: [
						['link[rel="apple-touch-icon"]', element => element.getAttribute('href')],
						['link[rel="apple-touch-icon-precomposed"]', element => element.getAttribute('href')],
						['link[rel="icon" i]', element => element.getAttribute('href')],
						['link[rel="fluid-icon"]', element => element.getAttribute('href')],
						['link[rel="shortcut icon"]', element => element.getAttribute('href')],
						['link[rel="Shortcut Icon"]', element => element.getAttribute('href')],
						['link[rel="mask-icon"]', element => element.getAttribute('href')],
					],
					scorers: [
						// Handles the case where multiple icons are listed with specific sizes ie
						// <link rel="icon" href="small.png" sizes="16x16">
						// <link rel="icon" href="large.png" sizes="32x32">
						(element, score) => {
							const sizes = element.getAttribute('sizes');

							if (sizes) {
								const sizeMatches = sizes.match(/\d+/g);
								if (sizeMatches) {
									return sizeMatches[0];
								}
							}
						}
					],
					defaultValue: (context) => 'favicon.ico',
					processors: [
						(icon_url, context) => makeUrlAbsolute(context.url, icon_url)
					]
				},

				image: {
					rules: [
						['meta[property="og:image:secure_url"]', element => element.getAttribute('content')],
						['meta[property="og:image:url"]', element => element.getAttribute('content')],
						['meta[property="og:image"]', element => element.getAttribute('content')],
						['meta[name="twitter:image"]', element => element.getAttribute('content')],
						['meta[property="twitter:image"]', element => element.getAttribute('content')],
						['meta[name="thumbnail"]', element => element.getAttribute('content')],
					],
					processors: [
						(image_url, context) => makeUrlAbsolute(context.url, image_url)
					],
				},

				keywords: {
					rules: [
						['meta[name="keywords" i]', element => element.getAttribute('content')],
					],
					processors: [
						(keywords, context) => keywords.split(',').map((keyword) => keyword.trim())
					]
				},

				title: {
					rules: [
						['meta[property="og:title"]', element => element.getAttribute('content')],
						['meta[name="twitter:title"]', element => element.getAttribute('content')],
						['meta[property="twitter:title"]', element => element.getAttribute('content')],
						['meta[name="hdl"]', element => element.getAttribute('content')],
						['title', element => element.text],
					],
				},

				language: {
					rules: [
						['html[lang]', element => element.getAttribute('lang')],
						['meta[name="language" i]', element => element.getAttribute('content')],
					],
					processors: [
						(language, context) => language.split('-')[0]
					]
				},

				type: {
					rules: [
						['meta[property="og:type"]', element => element.getAttribute('content')],
					],
				},

				url: {
					rules: [
						['a.amp-canurl', element => element.getAttribute('href')],
						['link[rel="canonical"]', element => element.getAttribute('href')],
						['meta[property="og:url"]', element => element.getAttribute('content')],
					],
					defaultValue: (context) => context.url,
					processors: [
						(url, context) => makeUrlAbsolute(context.url, url)
					]
				},

				provider: {
					rules: [
						['meta[property="og:site_name"]', element => element.getAttribute('content')]
					],
					defaultValue: (context) => getProvider(parseUrl(context.url))
				},
			};

			function getMetadata(doc, url, customRuleSets) {
				const metadata = {};
				const context = {
					url,
				};

				const ruleSets = customRuleSets || metadataRuleSets;

				Object.keys(ruleSets).map(ruleSetKey => {
					const ruleSet = ruleSets[ruleSetKey];
					const builtRuleSet = buildRuleSet(ruleSet);

					metadata[ruleSetKey] = builtRuleSet(doc, context);
				});

				return metadata;
			}

			module.exports = {
				buildRuleSet,
				getMetadata,
				getProvider,
				metadataRuleSets
			};


			/***/
		}),
/* 2 */
/***/ (function (module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function (global) {
				if (global.URL !== undefined) {
					// We're in Firefox
					module.exports = {
						makeUrlAbsolute(base, relative) {
							return new URL(relative, base).href;
						},
						parseUrl(url) {
							return new URL(url).host;
						}
					};
				} else {
					// We're in Node.js
					const urlparse = __webpack_require__(3);
					module.exports = {
						makeUrlAbsolute(base, relative) {
							const relativeParsed = urlparse.parse(relative);

							if (relativeParsed.host === null) {
								return urlparse.resolve(base, relative);
							}

							return relative;
						},
						parseUrl(url) {
							return urlparse.parse(url).hostname;
						}
					};
				}


				/* WEBPACK VAR INJECTION */
			}.call(exports, (function () { return this; }())))

			/***/
		}),
/* 3 */
/***/ (function (module, exports) {

			module.exports = window;

			/***/
		})
/******/]);

function getPageInfo() {
	const metadata = metadataparser.getMetadata(window.document, window.location);
	return metadata
}

getPageInfo();
