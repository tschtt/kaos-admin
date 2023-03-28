
module.exports = function (eleventyConfig) {

    // add css to template formats
    eleventyConfig.addTemplateFormats("css");
    eleventyConfig.addExtension("css", {
        outputFileExtension: "css",
        compile: (input) => (data) => {
            return input
        }
    })
    
    return {
        dir: {
            includes: "_includes",
            layouts: "_layouts",
            input: 'source',
            output: 'public',
        }
    }
}