/**
 * Build the syntax definition for Go as a host language
 * @param {HostSpec} hostSpec - Specification for the host language
 * @param {EmbeddedSpec[]} embeddedSpecs - Array of data about each
 * embedded language
 * @returns {json} - Json object containing a TextMate language injection
 */
export function buildGoSyntax(hostSpec, embeddedSpecs) {
    // Build the patterns that match each embedded language, using
    // a raw string prefixed by an inline comment
    // Example: /*sql*/ `...`
    const embeddedPatterns = embeddedSpecs.map((lang) => {
        return {
            'comment': `${lang.name}-formatted raw strings`,
            'begin': String.raw`(?x)
( (/\*) \s*
(?i:${lang.id_choice_re})
\s* (\*/) )
\s* (\`)
`,
            'beginCaptures': {
                '1': { 'name': 'comment.block.go' },
                '2': { 'name': 'punctuation.definition.comment.go' },
                '3': { 'name': 'punctuation.definition.comment.go' },
                '4': { 'name': 'punctuation.definition.string.begin.go' },
            },
            'contentName': `meta.embedded.block.${lang.vsname}.${hostSpec.vsname} ${lang.root_scope}`,
            'patterns': [{ 'include': `${lang.root_scope}` }],
            'end': '`',
            'endCaptures': {
                'name': 'punctuation.definition.string.end.go',
            },
        };
    });

    // Build the overall grammar injection file, and include the
    // patterns from above
    const syntax = {
        '$schema': 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
        'injectionSelector': `L:source.go -comment -string`,
        'scopeName': `${hostSpec.embedded_scope}`,
        'comment': `This file has been automatically generated by syntax_assembler.js
DO NOT HAND EDIT IT - changes will be lost.`,
        'patterns': [{ 'include': '#raw_strings' }],
        'repository': {
            'raw_strings': {
                'comment':
                    'These patterns all match Go raw strings and select one language. The syntax is injected into ' +
                    'https://github.com/microsoft/vscode/blob/main/extensions/go/syntaxes/go.tmLanguage.json',
                'patterns': embeddedPatterns,
            },
        },
    };

    return syntax;
}
