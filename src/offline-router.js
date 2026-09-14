/* 单文件入口：每次只挂载一个页面，支持前进/后退及直接链接。 */
(function(){
  const routes={home:"首页",dashboard:"进度看板",focus:"沉浸模式",classic:"经典课表",semester:"学期总览",progress:"进度全屏"};
  const files={"index.html":"home","dashboard.html":"dashboard","focus.html":"focus","classic.html":"classic","semester.html":"semester","progress.html":"progress"};
  function mount(){
    const page=location.hash.slice(1);
    document.body.dataset.page=Object.hasOwn(routes,page)?page:"home";
    renderSchedulePage();
    for(const link of document.querySelectorAll("a[href]")){
      const file=link.getAttribute("href").replace(/^\.\//,"");
      if(Object.hasOwn(files,file))link.setAttribute("href","#"+files[file]);
    }
    document.title=routes[document.body.dataset.page]+" · 课表空白模板";
    window.scrollTo({top:0,left:0,behavior:"instant"});
  }
  window.addEventListener("hashchange",mount);
  mount();
})();
