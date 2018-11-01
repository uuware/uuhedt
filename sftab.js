/*
 * SFTab(Simple Floating Tabs)
 * Visit http://www.uuware.com/ for details.
 */
var FTab_MSIE = (navigator.userAgent.indexOf('MSIE') >= 0 ? true : false); //used to judge as IE.
var FTab_M_Lst = []; //for save top win
var FTab_ActWin = null; //oMain for move window

var SFTab_PATH = ''; //path of style and also image.
var scripts = document.getElementsByTagName('script');
for(var i = 0; i < scripts.length; i++){
  var src = scripts[i].getAttribute('src');
  if(src && (src == 'sftab.js' || (src.length > 8 && (src.substring(src.length - 8 - 1) == '/sftab.js'
    || src.substring(src.length - 8 - 1) == '\\sftab.js')))){
    SFTab_PATH = src.substring(0, src.length - 8);
    break;
  }
}

function FTab_MResize(e)
{
  if(typeof FTab_MScroll == 'function') FTab_MScroll(e);
  var d = document;
  m = d.getElementById('SFTab_popmask');
  if(m){
    var w = d.body.parentNode.clientWidth;
    var h = d.body.parentNode.clientHeight;
    var c = document.body;
    if(d.compatMode && d.compatMode.toLowerCase() == 'css1compat') c = d.documentElement;
    if(w < c.scrollWidth){
      w = c.scrollWidth;
    }
    if(h < c.scrollHeight){
      h = c.scrollHeight;
    }
    m.style.width = w +'px';
    m.style.height = h  +'px';
  }
}
//if onscroll is used,then need call this at there
if(typeof('addEvent') == 'function') {
  addEvent('scroll', FTab_MResize);
}
else {
  (window.addEventListener) ? window.addEventListener( "scroll", FTab_MResize, false ) : window.attachEvent("onscroll", FTab_MResize);
  (window.addEventListener) ? window.addEventListener( "resize", FTab_MResize, false ) : window.attachEvent("onresize", FTab_MResize);
}


function SFTab(m_ID, left, top, width, height, style, showPageIndex)
{
  var oMain = document.getElementById(m_ID);
  if(oMain == null || typeof(oMain) != 'object' || !oMain.hasChildNodes()) return null;
  if(typeof(oMain.objSelf) == 'object' && oMain.m_ID == m_ID) return oMain.objSelf;
  if(oMain.m_ID != m_ID || oMain.objCreated != 1)
  {
    oMain.m_ID = m_ID;
    oMain.objCreated = 1;
    oMain.objSelf = new SFTab(m_ID, left, top, width, height, style, showPageIndex);
    return oMain.objSelf;
  }

  var isInitOK = false;
  var tabPages = new Array();
  var tabTitles = new Array();
  var selectedIndex = 0;
  var oBody = null;
  this.m_ID = m_ID;
  oMain.tabPages = tabPages;

  //init,not show until show()
  init();

  //private function
  function isValid()
  {
    return (oMain != null && isInitOK);
  }

  //private function
  function init()
  {
    //style = 'title:1;close:1;move:0;status:1;scroll:1;tab:1;tabrect:1;';
    if(typeof(style) != 'string') style = '';
    style = style.replace(/ /g, '');
    var noScroll = (style.indexOf('scroll:0')>=0);
    var noStatus = (style.indexOf('status:0')>=0);
    var noTitle = (style.indexOf('title:0')>=0);
    var noClose = (noTitle || style.indexOf('close:0')>=0);
    var noMove = (noTitle || style.indexOf('move:0')>=0);
    var noTab = (style.indexOf('tab:0')>=0);
    var noTabRect = (noTitle && !noTab && style.indexOf('tabrect:0')>=0);
    var modal = (style.indexOf('modal:1')>=0);
    var center = (style.indexOf('center:1')>=0);

    //get all Page
    var oPage = oMain.firstChild;
    while(oPage){
      if(oPage.nodeName=='DIV' && typeof(oPage.title)=='string'){
        tabPages.push(oPage);
      }
      oPage = oPage.nextSibling;
    }
    if(tabPages.length <= 0) return false;

    oMain.cssText = 'padding:0px;';
    oMain.style.display = 'none';
    oMain.noClose = noClose;
    oMain.modal = modal;
    var sbuf = '<table id="' + m_ID + '_m_table"';
    var cs = 'background-color:#FFF;';
    if(!noTabRect) cs += 'border:1px solid #317082;';
    else cs += 'border:0px;';
    sbuf += ' style="'+cs+'" width="100%" height="100%" CELLPADDING="0" CELLSPACING="0">';
    //add Title
    if(!noTitle){
      if(typeof(oMain.title) != 'string') oMain.title = '';
      sbuf += '<tr><td style="height:11px;border:1px solid #418092;color:#FFF;background-color:#317082;font-size:11px;white-space:nowrap;text-align:right;overflow:hidden;padding:1px 1px 0px 3px;"><div style="border:0;padding:0px;margin:0px;vertical-align:top;" id="' + m_ID + '_t_title">';
      sbuf += '<span style="float:left;text-align:left;color:#DDDDDD;">';
      sbuf += oMain.title + '</span>';
      if(!noClose) sbuf += '<span style="cursor:pointer;float:right;" id="' + m_ID + '_t_close"/>[X]</span>';
      sbuf += '</div></td></tr>';
    }
    //add Tab
    if(!noTab){
      var cs = 'overflow:hidden;font-weight:bold;font-size:12px;white-space:nowrap;vertical-align:bottom;';
      if(!noTabRect) sbuf += '<tr><td style="'+cs+'border-bottom:3px double #317082;background-color:#E2EBED;">';
      else sbuf += '<tr><td style="'+cs+'border-bottom:1px solid #317082;background-color:#FFF;">';
      for(var i = 0; i < tabPages.length; i++){
        sbuf += '<span style="cursor:pointer;padding:4px 4px 0px 4px;background-color:#E2EBED;margin:1px 2px 0px 2px;" id="' + m_ID + '_p_title' + i + '">' + tabPages[i].title;
        sbuf += '</span>';
      }
      sbuf += '</td></tr>';
    }
    //add Body
    var cs = 'margin:0px;padding:0px;';
    if(!noTabRect) sbuf += '<tr><td style="'+cs+'"';
    else sbuf += '<tr><td style="'+cs+'border-top:0px;border-right:1px solid #317082;border-left:1px solid #317082;border-bottom:1px solid #317082;"';
    sbuf += ' style="height:99%;vertical-align:top;" id="' + m_ID + '_m_body"></td></tr>';
    //add StatusBar
    if(!noStatus && !noTabRect){
      sbuf += '<tr><td style="padding:0px 1px 0px 1px;border-top:3px double #317082;background-color:#E2EBED;clear:both;font-size:11px;text-align:right;cursor:default;overflow:hidden;white-space:nowrap;">';
      sbuf += '<table CELLPADDING="0" CELLSPACING="0" BORDER="0" style="font-size:9px;width:100%;"><tr><td style="width:99%;padding:0px;margin:0px;vertical-align:top;"><span id="' + m_ID + '_s_title" style="font-size:10px;margin:0px;padding:0px;float:left;text-align:left;"></span>';
      sbuf += '</td></tr></table></td></tr>';
    }
    sbuf += '</table>';

    var div = document.createElement('DIV');
    oMain.insertBefore(div, oMain.firstChild);
    div.style.cssText = 'height:100%;width:100%;margin:0px;padding:0px;';
    div.innerHTML = sbuf;

    oBody = document.getElementById(m_ID + '_m_body');
    var oTable = document.getElementById(m_ID + '_m_table');
    //add Body Contents
    for(var i = 0; i < tabPages.length; i++)
    {
      tabPages[i].cssText = 'margin:0px;padding:1px 3px 1px 3px;';
      oBody.appendChild(tabPages[i]);
      sbuf = '' + tabPages[i].style.cssText;
      if(noScroll) sbuf = 'overflow-x:hidden;overflow-y:hidden;' + sbuf;
      else sbuf = 'overflow-x:auto;overflow-y:auto;' + sbuf;
      if(navigator.userAgent.indexOf('Opera')>=0 && !noScroll) sbuf = 'overflow:scroll;' + sbuf;
      tabPages[i].style.cssText = sbuf; //'margin:0px;padding:0px;' + 
    }

    if(!noTitle){
      var oTmp = document.getElementById(m_ID + '_t_title').parentNode;
      oTmp.onselectstart = cancelEvent;
      oTmp.ondragstart = cancelEvent;
      oTmp.onmousedown = doMDown;
      if(!noMove){
        oTmp.style.cursor = 'move';
        oMain.style.position = 'absolute';
      }
      if(!noClose){
        var oTmp = document.getElementById(m_ID + '_t_close');
        oTmp.onclick = function(){hide();return false;};
      }
    }

    if(!noTab){
      for(var i = 0; i < tabPages.length; i++)
      {
        var oTmp = document.getElementById(m_ID + '_p_title' + i);
        oTmp.onselectstart = cancelEvent;
        oTmp.ondragstart = cancelEvent;
        oTmp.onmousedown = cancelEvent;
        oTmp.save_index = i;
        oTmp.onclick = function(){show(this.save_index);return false;};
      }
    }

    var oTmp = document.getElementById(m_ID + '_s_title');
    if(oTmp){
      oTmp.parentNode.onselectstart = cancelEvent;
      oTmp.parentNode.ondragstart = cancelEvent;
      oTmp.parentNode.onmousedown = cancelEvent;
      var oTmp = document.getElementById(m_ID + '_s_move');
      if(oTmp) oTmp.onmousedown = doMDownStatus;
    }

    var nState = 1;
    if(style.indexOf('initmin:0')>=0) nState = 0;
    if(typeof(showPageIndex) != 'number' || showPageIndex >= tabPages.length || showPageIndex < 0) showPageIndex = 0;
    isInitOK = true;
    show(showPageIndex);

    //if not noMove,must set left&top
    if(!noMove){
      if(typeof(left) != 'number') left = oMain.offsetLeft;
      if(typeof(top) != 'number') top = oMain.offsetTop;
    }
    if(typeof(left) == 'number') oMain.style.left = left + 'px';
    else if(typeof(left) == 'string') oMain.style.left = left;
    if(typeof(top) == 'number') oMain.style.top = top + 'px';
    else if(typeof(top) == 'string') oMain.style.top = top;

    if(typeof(width) == 'number'){
      oMain.style.width = width + 'px';
      for(var i = 0; i < tabPages.length; i++)
        tabPages[i].style.width = width + 'px';
    }
    else if(typeof(width) == 'string') oMain.style.width = width;
    if(typeof(height) == 'number'){
      oMain.M_OffsetH = (oMain.clientHeight - tabPages[selectedIndex].clientHeight);
      height -= oMain.M_OffsetH;
      if(height < 0) height = 0;
      height += oMain.M_OffsetH;
      oMain.style.height = height + 'px';
      oMain.M_OffsetH = height;
      var oTmp = document.getElementById(m_ID + '_t_title');
      if(oTmp) height -= oTmp.parentNode.clientHeight;
      var oTmp = document.getElementById(m_ID + '_s_title');
      if(oTmp) height -= oTmp.parentNode.clientHeight;
      oMain.M_OffsetH -= height;

      for(var i = 0; i < tabPages.length; i++)
        tabPages[i].style.height = height + 'px';
      oBody.style.height = height + 'px';
    }
    else if(typeof(height) == 'string') oMain.style.height = height;

    if(FTab_MSIE && !noMove){
      var iframe = document.createElement('<IFRAME id="' + m_ID + '_i_ifrm" scrolling="no" frameborder="0" src="about:blank" style="position:absolute;padding:0px;top:-1px;left:-1px;z-index:3;">');
      oMain.appendChild(iframe);
      oTable.parentNode.style.cssText = 'position:absolute;height:100%;width:100%;margin:0px;padding:0px;top:0px;left:0px;z-index:10;';
      iframe.style.width = (oTable.clientWidth+3) + 'px';
      iframe.style.height = (oTable.clientHeight+3) + 'px';
    }
    if(!noMove && center){
      var d = document.body;
      if(document.compatMode && document.compatMode.toLowerCase() == 'css1compat') d = document.documentElement;
      var l = 0 + ( document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft );
      var t = 0 + ( document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop );
      oMain.style.left = l + (document.body.clientWidth - oTable.clientWidth)/2 + 'px';
      oMain.style.top = t + (document.body.clientHeight - oTable.clientHeight)/2 + 'px';
    }

    return this;
  }

  this.cancelEvent = cancelEvent;
  function cancelEvent()
  {
    return false;
  }

  this.doMMask = doMMask;
  function doMMask(e)
  {
    m = document.getElementById(oMain.m_ID + '_mmask');
    if(!m){
      m = document.createElement('div');
      m.id = oMain.m_ID + '_mmask';
      oMain.appendChild(m);
      m.style.cssText = 'display:none;position:absolute;z-index:99990;top: 20px;left: 0px;width: 100%;height: 100%;';
    }
    m.style.display = '';
  }

  this.doMDown = doMDown;
  function doMDown(e)
  {
    if(document.all)e = event;
    var oTmp = document.getElementById(m_ID + '_t_title');
    if(!oTmp || !oMain.style || (oMain.style.position != 'absolute' && oMain.style.position != 'fixed') || oTmp.parentNode.style.cursor == 'default') return false;
    if((e.button && e.button != 1) || (e.which && e.which != 1)) return false;
    FTab_ActWin = oMain;
    FTab_ActWin.M_InitX = e.clientX;
    FTab_ActWin.M_InitY = e.clientY;
    FTab_ActWin.M_PosX = oMain.style.left.replace('px','')/1;
    FTab_ActWin.M_PosY = oMain.style.top.replace('px','')/1;
    FTab_ActWin.M_Moving = true;
    FTab_ActWin.M_MovingType = 1;
    FTab_ActWin.M_DocMMove = document.onmousemove;
    FTab_ActWin.M_DocMStop = document.onmouseup;
    document.onmousemove = doMMove;
    document.onmouseup = doMUp;
    doMMask(e);
    return false;
  }
  this.doMUp = doMUp;
  function doMUp(e)
  {
    var m = document.getElementById(oMain.m_ID + '_mmask');
    if(m) m.style.display = 'none';
    if(!FTab_ActWin || !FTab_ActWin.M_Moving) return false;
    document.onmousemove = (FTab_ActWin.M_DocMMove ? FTab_ActWin.M_DocMMove : null);
    document.onmouseup = (FTab_ActWin.M_DocMStop ? FTab_ActWin.M_DocMStop : null);
    FTab_ActWin.M_Moving = false;
    return false;
  }
  this.doMMove = doMMove;
  function doMMove(e)
  {
    if(!FTab_ActWin || !FTab_ActWin.M_Moving) return false;
    if(window.getSelection) window.getSelection().removeAllRanges();
    else if(document.selection) document.selection.empty();
    if(document.all){
      e = event;
      if(e.button != 1) return doMUp(e);
    }
    else if(e.which != 1) return doMUp(e);
    var leftPos = FTab_ActWin.M_PosX + e.clientX - FTab_ActWin.M_InitX;
    var topPos = FTab_ActWin.M_PosY + e.clientY - FTab_ActWin.M_InitY;
    if(topPos < 0) topPos = 0;
    if(leftPos < 0) leftPos = 0;
    FTab_ActWin.style.left = leftPos + 'px';
    FTab_ActWin.style.top = topPos + 'px';
    return false;
  }

  this.cancelEvent = cancelEvent;
  function cancelEvent()
  {
    return false;
  }

  //show TabPage
  this.show = show;
  function show(pageIndex)
  {
    if(!isValid()) return false;
    if(typeof(pageIndex) == 'number' && pageIndex < tabPages.length && pageIndex >= 0){
      var curH = tabPages[selectedIndex].style.height;
      var curW = tabPages[selectedIndex].style.width;
      selectedIndex = pageIndex;
      for(var i = 0; i < tabPages.length; i++)
      {
        var div = document.getElementById(m_ID + '_p_title' + i);
        if(i == pageIndex){
          tabPages[i].style.display = '';
          if(div) div.style.backgroundColor = '#19c8f9';
          tabPages[i].style.width = curW;
          tabPages[i].style.height = curH;
        }
        else{
          tabPages[i].style.display = 'none';
          if(div) div.style.backgroundColor = '#E2EBED';
        }
      }
    }
    var m = null;
    if(oMain.modal && oMain.style.display == 'none'){
      var ind = FTab_M_Lst.length;
      var obj = new Object();
      obj.oMain = oMain;
      FTab_M_Lst[ind] = obj;
      m = document.getElementById('SFTab_popmask');
      if(!m){
        m = document.createElement('div');
        m.id = 'SFTab_popmask';
        document.body.insertBefore(m, document.body.firstChild);
        m.style.cssText = 'display:none;cursor:wait;position:absolute;z-index:99990;top: 0px;left: 0px;width: 100%;height: 100%;-moz-opacity:0.8; filter:alpha(opacity=80);background-color:transparent !important;background-image: url('+SFTab_PATH+'maskbg.png) !important;background-repeat: repeat;';
      }
      FTab_MResize();
      if(ind > 0){
        //hide prev win
        var obj2 = FTab_M_Lst[ind-1];
        obj2.oMain.style.zIndex = m.style.zIndex/1 - 2;
      }
      m.style.display = '';
    }
    oMain.style.display = '';
    if(m){
      oMain.style.zIndex = 2 + m.style.zIndex/1;
    }
    return true;
  }

  this.hide = hide;
  function hide()
  {
    if(!isValid()) return false;

    if(oMain.modal && (oMain.style.display == '' || oMain.style.display == 'block')){
      var m = document.getElementById('SFTab_popmask');
      var obj = FTab_M_Lst.pop();
      if(FTab_M_Lst.length > 0){
        var obj2 = FTab_M_Lst[FTab_M_Lst.length-1];
        //restore prev win
        obj2.oMain.style.zIndex = 2 + m.style.zIndex/1;
      }
      if(FTab_M_Lst.length <= 0){
        m.style.display = "none";
      }
    }

    oMain.style.display = 'none';
    return true;
  }

  //private function(obj = oMain)
  function minWidth(obj)
  {
    if(isValid() && oMain.style.display != 'none'){
      var oTmp2 = document.getElementById(m_ID + '_i_ifrm');
      if(oTmp2){
        var oTmp = document.getElementById(m_ID + '_m_table');
        oTmp2.style.width = (oTmp.clientWidth+3) + 'px';
        oTmp2.style.height = (oTmp.clientHeight+3) + 'px';
      }
    }
  }

  this.setStatus = setStatus;
  function setStatus(str)
  {
    if(!isValid()) return false;
    var div = document.getElementById(m_ID + '_s_title');
    if(div){
      div.innerHTML = str;
      minWidth(oMain);
    }
    return true;
  }

  //get selectedIndex
  this.getSelectedIndex = getSelectedIndex;
  function getSelectedIndex()
  {
    return selectedIndex;
  }

  this.isHide = isHide;
  function isHide()
  {
    if(!isValid()) return false;
    return (oMain.style.display == 'none');
  }

  return this;
}
