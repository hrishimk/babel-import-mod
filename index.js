const fs = require('fs');
const Path = require('path');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');

module.exports = function MyPlugin(ref) {
    var t = ref.types;

    function path_check(path) {
        let fname = path.node.source.value;
        let specifiers = path.node.specifiers;
        let has_specifiers = specifiers.length ? true : false;
        let fpath = Path.join(Path.dirname(fname), fname);
        let mod_file = fs.readFileSync(fpath, 'UTF-8');
        let {
            code,
            ast
        } = babel.transformSync(mod_file, {
            "presets": ["@babel/preset-typescript"],
            sourceType: "module",
            filename: fname,
            ast: true,
        });
        if (!has_specifiers) {
            traverse(ast, {
                ImportDeclaration: function (ipath) {
                    path_check(ipath);
                },
                ExportDeclaration: function (xpath) {
                    handle_export(xpath);
                }
            });
            path.replaceWith(ast);
        } else {
            traverse(ast, {
                ImportDeclaration: function (ipath) {
                    path_check(ipath);
                },
                ExportDeclaration: function (ex_path) {
                    let imports = [];
                    for (let i = 0, q = specifiers.length; i < q; i++) {
                        let s = specifiers[i];
                        let node = ex_path.node;
                        if (node.declaration) {
                            if (node.declaration.id.name === s.imported.name) {
                                imports.push(node.declaration);
                            }
                        } else if (node.declarations) {
                            for (let j = 0, w = node.declarations.length; j < w; j++) {
                                let d = node.declarations[j];
                                if (d.id.name === s.imported.name) {
                                    imports.push(d);
                                }
                            }
                        } else {
                            throw "No declaration for node";
                        }
                    }
                    if (imports.length) {
                        let p = types.program(imports);
                        let f = types.file(p);
                        ex_path.replaceWith(f);
                    }
                }
            });
            path.replaceWith(ast);
        }
        const output = generate(path);
    }

    function handle_export(path, imports) {
        let node = path.node;
        if (node.declaration) {
            path.replaceWith(node.declaration);
        }
    }

    function import_elems(path) {
        let node = path.node;
        if (node.declaration) {
            imports.push(node.declaration);
        }
    }

    return {
        visitor: {
            ImportDeclaration: {
                enter: function (path) {
                    path_check(path);
                }
            },
            ExportDeclaration: {
                enter: function (path) {
                    handle_export(path);
                }
            }
        }
    };
};