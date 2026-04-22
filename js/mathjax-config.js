window.MathJax = {
  loader: { load: ['[tex]/html'] },
  tex: {
    packages: { '[+]': ['html'] },
    macros: {
      param: ['{\\class{param-blue}{#1}}', 1]
    }
  },
  options: {
    renderActions: {
      addMenu: []
    }
  }
};
