/*******************************************************************************
	uuHEdt(uu Html Edit)
	Copyright (c) 2006-2009 uuware.com. All rights reserved.
	Developed by project@uuware.com, Visit http://www.uuware.com/ for details.

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*******************************************************************************/
var UUHEdt_VER = '1.05';
var UUHEdt_MSIE = (navigator.userAgent.indexOf('MSIE') >= 0 ? true : false); //used to judge as IE.
var UUHEdt_JS = 'uuhedt.js'; //only used for get path of this js.
var UUHEdt_PATH = ''; //path of style and also image.
//get relative style&image path(same to js's path)
var scripts = document.getElementsByTagName('script');
for(var i = 0; i < scripts.length; i++)
{
  var src = scripts[i].getAttribute('src');
  //only get path from first 'uuhedt.js'
  if(src && src.length >= UUHEdt_JS.length && src.substring(src.length-UUHEdt_JS.length-1) == '/'+UUHEdt_JS){
    UUHEdt_PATH = src.substring(0, src.length - UUHEdt_JS.length);
    break;
  }
}

//must work with SFtab or FTab(http://www.uuware.com/js_ftab_en.htm)
var UUHEdts =
{
  //public fun
  getEditor : function(id, options) {
    return UUHEdt(id, options);
  },
  lang : function(id) {
    var def = this.m_deflang;
    if(def == 'AUTO' || def == '')
      def = (navigator.language || navigator.userLanguage).substr(0,2).toUpperCase();
    if(typeof(this.m_langs[def])=='undefined' || typeof(this.m_langs[def][id])=='undefined') def = 'EN';
    if(typeof(this.m_langs[def])!='undefined' && typeof(this.m_langs[def][id])!='undefined') return this.m_langs[def][id];
    return id;
  },
  getPlugin : function(name) {
    name = name.toUpperCase();
    if(typeof(this.m_plugins[name])!='undefined') return this.m_plugins[name];
    return null;
  },
  //here is lang's list,for get lang of id use of lang(id)
  getLang : function(name) {
    name = name.toUpperCase();
    if(typeof(this.m_langs[name])!='undefined') return this.m_langs[name];
    return null;
  },
  //deflang must be set before any of new editor.'auto' for same to brower.
  setDefLang : function(langid) {
    if(langid != 'auto' && langid.length != 2){
      alert('worng for default lang:'+langid+', must be 2 bits like:EN or JA.');
      return;
    }
    this.m_deflang = langid.toUpperCase();
    this.initLang(true);
  },
  addPlugin : function(name, plugin) {
    plugin.name = name.toUpperCase();
    this.m_plugins[plugin.name] = plugin;
  },
  addLang : function(name, lang) {
    lang.name = name.toUpperCase();
    this.m_langs[lang.name] = lang;
  },

  //save btn.name to btn.nameid, and save lang of btn.nameid to btn.name.force=true for reset lang.
  initLang : function(force) {
    if(!force && this.m_initlang != 0) return;
    this.m_initlang = 1;
    for(pluginname in this.m_plugins) {
      var btns = this.m_plugins[pluginname].buttons;
      for(iconName in btns) {
        var btn = btns[iconName];
        var id = btn.nameid || btn.name;
        btn.nameid = id;
        var l = this.userInitLang(id, this.m_plugins[pluginname], btn);
        if(typeof(l) != 'string') l = this.lang(id);
        btn.name = l;
      }
    }
  },

  //private fun
  m_deflang : '',
  m_initlang : 0,
  m_plugins : {},
  m_langs : {},
  //default icons image file
  m_iconsFile : 'buttons_morden.gif',
  m_cors : ['#ff0000','#00ff00','#0000ff','#00ffff','#ff00ff','#ffff00','#888888','#cccccc','#ffffff','#000000'],
  saveColor : function(c) {
    if(this.search(this.m_cors, c) == null){
      for(var i=0;i<9;i++) this.m_cors[i] = this.m_cors[i+1];
      this.m_cors[9] = c;
    }
  },
  onButtonClick : function(obj, pluginname, btnid, subbtnid, pid, p6, p7, p8) {
    var o = this.m_plugins[pluginname];
    var editor = UUHEdts.getEditor(pid);
    var r = this.userButtonClick(editor, o, obj, btnid, subbtnid, p6, p7, p8);
    if(typeof(r) == 'number' && r < 0) return;
    editor.closeWin();
    o.onButtonClick(editor, pluginname, btnid, obj, p6, p7, p8);
  },
  onSelectedChanged : function(obj, pluginname, btnid, pid, p6, p7, p8) {
    var o = this.m_plugins[pluginname];
    var editor = UUHEdts.getEditor(pid);
    var r = this.userSelectedChanged(editor, o, obj, btnid, obj.value, p6, p7, p8);
    if(typeof(r) == 'number' && r < 0) return;
    o.onSelectedChanged(editor, pluginname, btnid, obj.options[obj.selectedIndex].text, obj.value, p6, p7, p8);
    obj.selectedIndex = 0;
  },
  onPopClick : function(e, obj, pluginname, btnid, subbtnid, pid, p6, p7, p8) {
    e = e || window.event;
    var o = this.m_plugins[pluginname];
    var editor = UUHEdts.getEditor(pid);
    var r = this.userPopClick(editor, o, obj, btnid, subbtnid, p6, p7, p8);
    if(typeof(r) == 'number' && r < 0) return;
    o.onPopClick(e, editor, pluginname, btnid, subbtnid, obj, p6, p7, p8);
    e.returnValue = false;
    e.cancelBubble = true;
  },
  closeWin : function(pid) {
    var editor = UUHEdts.getEditor(pid);
    var r = this.userCloseWin(editor);
    if(typeof(r) == 'number' && r < 0) return;
    editor.closeWin();
  },
  addEvent : function(obj, type, fn) {
    (obj.addEventListener) ? obj.addEventListener( type, fn, false ) : obj.attachEvent("on"+type, fn);  
  },
  calPos : function(o) {
    var l=0, t=0;
    while (o)
    {
      l += o.offsetLeft;
      t += o.offsetTop;
      if(o.style.position=='absolute') {
        break;
      }
      o = o.offsetParent;
    }
    return [l, t];
  },
  search : function(arr,itm) {
    for(var i=0; i < arr.length; i++) {
      if(arr[i] == itm) return i;
    }
    return null;
  },
  color2hex : function(c) {
    var p = c.toLowerCase().indexOf('rgb(');
    if(p >= 0){
      var ar = c.substring(p+4).replace(/[)]| /g, '').split(',');
      c = '#' + this.dec2hex((parseInt(ar[0]) << 16) + (parseInt(ar[1]) << 8) + parseInt(ar[2]));
    }
    else{
      var p = c.indexOf('#');
      if(p >= 0){
        var ar = c.substring(p).replace(/,|;/g, ' ').split(' ');
        c = ar[0];
      }
      else{
        var ar = c.replace(/none|dotted|dashed|solid|double|groove|ridge|inset|outset|px/gi, '').split(' ');
        if(ar.length > 0 && ar[0].length > 3) c = ar[0];
        else if(ar.length > 1) c = ar[1];
      }
    }
    return c;
  },
  dec2hex : function(v) {
    v = v.toString(16);
    for(; v.length < 6; v = '0' + v);
    return v;
  },

  //user event
  userInitLang : function(id, pluginobj, btnobj) {
    //should return id'lang
  },
  userSavingContent : function(html) {
    //must return processed html
    return html;
  },
  userButtonClick : function(editorobj, pluginobj, btnobj, btnid, subid) {
  },
  userSelectedChanged : function(editorobj, pluginobj, btnobj, btnid, selValue) {
  },
  userPopClick : function(editorobj, pluginobj, btnobj, btnid, subid) {
  },
  userCloseWin : function(editorobj) {
  },
  userEditorDblClick : function(e, editorobj, element) {
  }
};

//must before any of new UUHEdt
var UUHEdtLangEN = {
  name : 'EN',
  'Bold' : 'Bold',
  'Italic' : 'Italic',
  'Underline' : 'Underline',
  'Left Align' : 'Left Align',
  'Center Align' : 'Center Align',
  'Right Align' : 'Right Align',
  'Justify Align' : 'Justify Align',
  'ol' : 'Insert Ordered List',
  'ul' : 'Insert Unordered List',
  'Subscript' : 'Subscript',
  'Superscript' : 'Superscript',
  'Strike Through' : 'Strike Through',
  'Remove Formatting' : 'Remove Formatting',
  'Indent Text' : 'Indent Text',
  'Remove Indent' : 'Remove Indent',
  'Horizontal Rule' : 'Horizontal Rule',
  'Horizontal Rule' : 'Horizontal Rule',
  'Horizontal Rule' : 'Horizontal Rule',
  'Undo' : 'Undo',
  'Redo' : 'Redo',
  'Print' : 'Print',
  'SHelp' : 'Online Help',
  'SAbout' : 'About uuHEdt',
  'SDate' : 'Insert Date',
  'STime' : 'Insert Time',
  'FSize' : 'Font Size',
  'FFamily' : 'Font Family',
  'FFormat' : 'Font Format',
  'BColor' : 'Background Color',
  'TColor' : 'Text Color',
  'Smile Face' : 'Smile Face',
  'Edit HTML' : 'Edit HTML',
  'Preview' : 'Preview',
  'Edit Image' : 'Edit Image',
  'Edit Link' : 'Edit Link',
  'UnLink' : 'UnLink',

  'OK' : 'OK',
  'Cancel' : 'Cancel',

  'CM-SelCont' : 'Please select contents.',

  //pickcolor
  'PC-Saved' : 'Saved:',
  'PC-WColor' : 'Web Color',
  'PC-FColor' : 'Free Color',
  'PC-Title' : 'Pick Color',
  'PC-DClick' : '(double Click to select color)'
};
UUHEdts.addLang(UUHEdtLangEN.name, UUHEdtLangEN);

var UUHEdtFont = {
  name : 'UUHEdtFont',
  buttons : {
    'fontsize' : {iconx : -1, icony : -1, name : 'FSize', command : 'fontsize', selitems : {
        '' : UUHEdts.lang('FSize'), 1 : '1&nbsp;(8pt)', 2 : '2&nbsp;(10pt)', 3 : '3&nbsp;(12pt)', 4 : '4&nbsp;(14pt)', 5 : '5&nbsp;(18pt)', 6 : '6&nbsp;(24pt)'
      }
    },
    'fontfamily' : {iconx : -1, icony : -1, name : 'FFamily', command : 'fontname', selitems : {
        '' : UUHEdts.lang('FFamily'), 'arial' : 'Arial','comic sans ms' : 'Comic Sans','courier new' : 'Courier New','georgia' : 'Georgia', 'helvetica' : 'Helvetica', 'impact' : 'Impact', 'times new roman' : 'Times', 'trebuchet ms' : 'Trebuchet', 'verdana' : 'Verdana'
      }
    },
    'fontformat' : {iconx : -1, icony : -1, name : 'FFormat', command : 'formatBlock', selitems : {
       '' : UUHEdts.lang('FFormat'),  'p' : 'Paragraph', 'pre' : 'Pre', 'h6' : 'Heading&nbsp;6', 'h5' : 'Heading&nbsp;5', 'h4' : 'Heading&nbsp;4', 'h3' : 'Heading&nbsp;3', 'h2' : 'Heading&nbsp;2', 'h1' : 'Heading&nbsp;1'
      }
    }
  },
  onSelectedChanged : function(editor, pluginname, btnid, selText, selValue) {
    var btn = this.buttons[btnid];
    if(btnid == 'fontsize') {
      var s = selValue.substring(0,1);
      editor.execCommand(btn.command, s);
    }
    else if(btnid == 'fontfamily') {
      editor.execCommand(btn.command, selValue);
    }
    else if(btnid == 'fontformat') {
      editor.execCommand(btn.command, '<'+selValue.toUpperCase()+'>');
    }
  }
};
UUHEdts.addPlugin(UUHEdtFont.name, UUHEdtFont);

//'-' for new line, '|' for break
var UUHEdtBaseButtons = {
  name : 'UUHEdtBaseButtons',
  buttons : {
    'bold' : {iconx : 3, icony : 2, name : 'Bold', command : 'Bold', tags : ['B','STRONG'], css : {'font-weight' : 'bold'}, key : 'b'},
    'italic' : {iconx : 2, icony : 2, name : 'Italic', command : 'Italic', tags : ['EM','I'], css : {'font-style' : 'italic'}, key : 'i'},
    'underline' : {iconx : 2, icony : 0, name : 'Underline', command : 'Underline', tags : ['U'], css : {'text-decoration' : 'underline'}, key : 'u'},
    'left' : {iconx : 0, icony : 0, name : 'Left Align', command : 'justifyleft'},
    'center' : {iconx : 1, icony : 1, name : 'Center Align', command : 'justifycenter'},
    'right' : {iconx : 1, icony : 0, name : 'Right Align', command : 'justifyright'},
    'justify' : {iconx : 0, icony : 1, name : 'Justify Align', command : 'justifyfull'},
    'ol' : {iconx : 0, icony : 3, name : 'ol', command : 'insertorderedlist', tags : ['OL']},
    'ul' : {iconx : 1, icony : 3, name : 'ul', command : 'insertunorderedlist', tags : ['UL']},
    'subscript' : {iconx : 3, icony : 1, name : 'Subscript', command : 'subscript', tags : ['SUB']},
    'superscript' : {iconx : 2, icony : 1, name : 'Superscript', command : 'superscript', tags : ['SUP']},
    'strikethrough' : {iconx : 3, icony : 0, name : 'Strike Through', command : 'strikeThrough', css : {'text-decoration' : 'line-through'}},
    'removeformat' : {iconx : 0, icony : 5, name : 'Remove Formatting', command : 'removeformat'},
    'indent' : {iconx : 0, icony : 2, name : 'Indent Text', command : 'indent'},
    'outdent' : {iconx : 1, icony : 2, name : 'Remove Indent', command : 'outdent'},
    'hr' : {iconx : 6, icony : 0, name : 'Horizontal Rule', command : 'insertHorizontalRule'},
    'undo' : {iconx : 4, icony : 2, name : 'Undo', command : 'undo'},
    'redo' : {iconx : 5, icony : 2, name : 'Redo', command : 'redo'},
    'print' : {iconx : 8, icony : 1, name : 'Print'},
    'help' : {iconx : 9, icony : 2, name : 'SHelp'},
    'about' : {iconx : 8, icony : 2, name : 'SAbout'},
    'date' : {iconx : 6, icony : 6, name : 'SDate'},
    'time' : {iconx : 6, icony : 7, name : 'STime'}
  },
  iconsFile : 'buttons_morden.gif',
  onButtonClick : function(editor, pluginname, btnid, btnobj) {
    var btn = this.buttons[btnid];
    if(btn && editor) {
      if(btnid == 'print') {
        editor.print();
      }
      else if(btnid == 'help') {
        var s = '<div title="'+btn.name+'" style="display:none;width:460px;"><div title="">'
              + 'uuHEdt(uu Html Edit) '+UUHEdt_VER+'<br><br>online help: <a href="http://www.uuware.com/js_uuhedth_en.htm" target="_blank">Help on http://www.uuware.com/</a></div></div>';
        editor.openWin(btnobj, btn.name, s, 465, 90, '', true);
      }
      else if(btnid == 'about') {
        var s = '<div title="'+btn.name+'" style="display:none;width:460px;"><div title="">'
              + 'uuHEdt(uu Html Edit) '+UUHEdt_VER+'<br><br>uuHEdt(uu Html Edit) is a Free Online Web-Based WYSIWYG HTML Editor, and supports a wide variety of browsers such as IE, Opera, Firefox, Google Chrome and Safari.<br>For details visit: <a href="http://www.uuware.com/js_uuhedt_en.htm" target="_blank">http://www.uuware.com/js_uuhedt_en.htm</a></div></div>';
        editor.openWin(btnobj, btn.name, s, 465, 180, '', true);
      }
      else if(btnid == 'date') {
        var date = new Date();
        var year = date.getFullYear().toString(10);
        var month = (date.getMonth() + 1).toString(10);
        month = month.length < 2 ? '0' + month : month;
        var day = date.getDate().toString(10);
        day = day.length < 2 ? '0' + day : day;
        editor.pasteHTML(year + '/' + month + '/' + day);
      }
      else if(btnid == 'time') {
        var date = new Date();
        var hour = date.getHours().toString(10);
        hour = hour.length < 2 ? '0' + hour : hour;
        var minute = date.getMinutes().toString(10);
        minute = minute.length < 2 ? '0' + minute : minute;
        var second = date.getSeconds().toString(10);
        second = second.length < 2 ? '0' + second : second;
        editor.pasteHTML(hour + ':' + minute + ':' + second);
      }
      else if(btn.command) {
        editor.execCommand(btn.command, btn.commandArgs);
      }
    }
  }
};
UUHEdts.addPlugin(UUHEdtBaseButtons.name, UUHEdtBaseButtons);

var UUHEdtColor = {
  name : 'UUHEdtColor',
  buttons : {
    'bgcolor' : {iconx : 2, icony : 3, name : 'BColor', command : 'hiliteColor'},
    'forecolor' : {iconx : 3, icony : 3, name : 'TColor', command : 'forecolor'}
  },
  buildTd : function(editorid, pluginname, btnid, R, G, B, w, h) {
    var c = '#' + UUHEdts.dec2hex((R << 16) + (G << 8) + B);
    return '<td style="cursor:pointer;height:11px;width:11px;background-color:'+c+';" onmousemove="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\''+c+'\',\''+editorid+'\', \'\');" ondblclick="UUHEdts.onPopClick(event, this,\''+pluginname+'\',\''+btnid+'\',\''+c+'\',\''+editorid+'\', \'retu\');"></td>';
  },
  getWebColor_s : '',
  getWebColor : function(editor, pluginname, btnid) {
    if(this.getWebColor_s == '') {
      for (j = 0; j < 12; j ++) {
        this.getWebColor_s += "<tr>";
        for (k = 0; k < 3; k ++)
          for (i = 0; i <= 5; i ++){
            this.getWebColor_s += this.buildTd('_editorid_', this.name, '_btnid_', k * 51 + (j % 2) * 51 * 3, Math.floor(j / 2) * 51, i * 51, 8, 10);
          }
        this.getWebColor_s += "</tr>";
      }
      this.getWebColor_s = '<table CELLPADDING="0" CELLSPACING="1">'+this.getWebColor_s+'</table>';
    }
    return this.getWebColor_s.replace(/_btnid_/g, btnid).replace(/_editorid_/g, editor.id);
  },
  pickColor : function(editor, btnid, callback) {
    this['f_' + btnid] = callback;
    this.onButtonClick(editor, this.name, 'pick:'+btnid, null, UUHEdts.lang('PC-Title')+UUHEdts.lang('PC-DClick'));
  },
  onButtonClick : function(editor, pluginname, btnid, btnobj, title) {
    var detail = 50;
    var h = '';
    for (var i = 0; i < detail; i++){
      h += '<div id="gs'+i+'" style="background-color:#ffffff; width:15px; height:3px; border-style:none; border-width:0px;overflow: hidden;"'
      + ' onmousemove="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',this.style.backgroundColor,\''+editor.id+'\',\'\');" ondblclick="UUHEdts.onPopClick(event, this,\''+pluginname+'\',\''+btnid+'\',this.style.backgroundColor,\''+editor.id+'\',\'retu\');"></div>';
    }
    var csave = '<span>'+UUHEdts.lang('PC-Saved')+'</span>';
    for (var i = 0; i < 10; i++){
      csave += '<span style="cursor:pointer;border:1px solid #ddd;width:10px;background-color:'+UUHEdts.m_cors[i]+';" onmousemove="UUHEdts.onPopClick(event, this,\''+pluginname+'\',\''+btnid+'\',\''+UUHEdts.m_cors[i]+'\',\''+editor.id+'\', \'\');" ondblclick="UUHEdts.onPopClick(event, this,\''+pluginname+'\',\''+btnid+'\',\''+UUHEdts.m_cors[i]+'\',\''+editor.id+'\', \'retu\');">'+i+'</span>';
    }

    if(!title){
      var btn = this.buttons[btnid];
      if(btn) {
        title = btn.name+UUHEdts.lang('PC-DClick');
      }
    }
    var s = '<div title="'+title+'" style="display:none;width:330px;">'
     + '<div title="'+UUHEdts.lang('PC-WColor')+'">'
     + this.getWebColor(editor, this.name, btnid)
     + '</div>'
     + '<div title="'+UUHEdts.lang('PC-FColor')+'">'
     + '<table><tr><td><img id="colorpickerimg" src="'+UUHEdt_PATH+'colorpicker.jpg" style="cursor: crosshair;border:0;" '
     + 'onmousemove="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'0\',\''+editor.id+'\',\'\');"  '
     + 'onmousedown="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'0\',\''+editor.id+'\',\'show\');" '
     + 'ondblclick="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'1\',\''+editor.id+'\',\'retu\');">'
     + '</td><td width="15px"><div id="light" style="border: 1px solid gray;width: 15px;cursor: crosshair;">'+h+'</div></td></tr></table>'
     + '</div>';
     var status = '<div style="width:325px;"><div id="colorpickersave" style="float:right;font-size:9pt;font-family:courier new;height:15px;">'+csave+'</div>'
     + '<div id="colorpickerinfo" style="font-size:8pt;font-family:courier new;width:150px;height:14px;background-color:#dddddd;">'
     + '<span style="color:#fff;">#dddddd</span><span style="color:#000;">#dddddd</span></div>'
     + '<input type="button" value="'+UUHEdts.lang('OK')+'" onclick="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'ok\',\''+editor.id+'\');">'
     + '<input type="button" value="'+UUHEdts.lang('Cancel')+'" onclick="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'cancel\',\''+editor.id+'\');">'
     + '</div>';
    editor.openWin(btnobj, title, s, 330, false, status);
  },
  onPopClick : function(e, editor, pluginname, btnid, subbtnid, btnobj, p6) {
    if(subbtnid.length == 1) {
      var elementObj = document.getElementById('colorpickerimg');
      return this.MMove(e, elementObj, editor, this.name, btnid, p6);
    }
    var info = document.getElementById('colorpickerinfo');
    if(subbtnid.substring(0, 4).toLowerCase() == 'rgb('){
      subbtnid = UUHEdts.color2hex(subbtnid);
    }
    if(subbtnid != 'ok' && subbtnid != 'cancel') {
      info.innerHTML = '<span style="color:#fff;">'+subbtnid+'</span><span style="color:#000;">'+subbtnid+'</span>';
      info.style.backgroundColor = subbtnid;
    }
    if(subbtnid == 'ok' || subbtnid == 'cancel' || p6 == 'retu') {
      if(subbtnid == 'ok' || p6 == 'retu') {
        var info = document.getElementById('colorpickerinfo');
        var c = info.style.backgroundColor;
        c = UUHEdts.color2hex(c);

        if(btnid.substring(0, 5) == 'pick:'){
          btnid = btnid.substring(5);
          var out = document.getElementById(btnid);
          if(out) {
            if(typeof(out.value) == 'string'){
              out.value = c;
            }
            else if(typeof(out.innerHTML) == 'string'){
              out.innerHTML = c;
            }
          }
          if(out && typeof(out.callback) == 'function'){
            out.callback(c);
          }
          if(typeof(this['f_' + btnid]) == 'function'){
            this['f_' + btnid](c);
          }
          c = '';
        }
        if(c != ''){
          UUHEdts.saveColor(c);
          var btn = this.buttons[btnid];
          if(UUHEdt_MSIE && btnid=='bgcolor') {
            editor.execCommand('backColor', c);
          }
          else {
            editor.execCommand(btn.command, c);
          }
        }
      }
      editor.closeWin();
    }
  },
  dechex : function(n) {
    var strhex = "0123456789abcdef";
    return strhex.charAt(Math.floor(n / 16)) + strhex.charAt(n % 16);
  },
  updateLight : function(r, g, b) {
    var detail = 50;
    var i, partDetail = detail / 2, finalCoef, finalR, finalG, finalB, color;
    for (i=0; i<detail; i++) {
      if ((i>=0) && (i<partDetail)) {
        finalCoef = i / partDetail;
        finalR = this.dechex(255 - (255 - r) * finalCoef);
        finalG = this.dechex(255 - (255 - g) * finalCoef);
        finalB = this.dechex(255 - (255 - b) * finalCoef);
      } else {
        finalCoef = 2 - i / partDetail;
        finalR = this.dechex(r * finalCoef);
        finalG = this.dechex(g * finalCoef);
        finalB = this.dechex(b * finalCoef);
      }
      color = finalR + finalG + finalB;
      document.getElementById('gs' + i).style.backgroundColor = '#'+color;
    }
  },
  MMove : function(e, elementObj, editor, pluginname, btnid, act) {
    var x, y, partWidth, partDetail, imHeight, r, g, b, coef;

    x = e.offsetX || e.layerX;
    y = e.offsetY || e.layerY;

    var detail = 50;
    partWidth = elementObj.width / 6;
    partDetail = detail / 2;
    imHeight = elementObj.height;

    r = (x >= 0)*(x < partWidth)*255 + (x >= partWidth)*(x < 2*partWidth)*(2*255 - x * 255 / partWidth) + (x >= 4*partWidth)*(x < 5*partWidth)*(-4*255 + x * 255 / partWidth) + (x >= 5*partWidth)*(x < 6*partWidth)*255;
    g = (x >= 0)*(x < partWidth)*(x * 255 / partWidth) + (x >= partWidth)*(x < 3*partWidth)*255  + (x >= 3*partWidth)*(x < 4*partWidth)*(4*255 - x * 255 / partWidth);
    b = (x >= 2*partWidth)*(x < 3*partWidth)*(-2*255 + x * 255 / partWidth) + (x >= 3*partWidth)*(x < 5*partWidth)*255 + (x >= 5*partWidth)*(x < 6*partWidth)*(6*255 - x * 255 / partWidth);

    coef = (imHeight - y) / imHeight;
    r = 128 + (r - 128) * coef;
    g = 128 + (g - 128) * coef;
    b = 128 + (b - 128) * coef;

    var c = '#' + this.dechex(r) + this.dechex(g) + this.dechex(b);
    var info = document.getElementById('colorpickerinfo');
    info.innerHTML = '<span style="color:#fff;">'+c+'</span><span style="color:#000;">'+c+'</span>';
    info.style.backgroundColor = c;

    if(act == 'show') {
      this.updateLight(r, g, b);
    }
    if(act == 'retu') {
      UUHEdts.saveColor(c);

      if(btnid.substring(0, 5) == 'pick:'){
        var out = document.getElementById(btnid.substring(5));
        if(out){
          out.value = c;
        }
      }
      else{
        var btn = this.buttons[btnid];
        if(UUHEdt_MSIE && btnid=='bgcolor') {
          editor.execCommand('backColor', c);
        }
        else {
          editor.execCommand(btn.command, c);
        }
      }
      editor.closeWin();
    }
  }
};
UUHEdts.addPlugin(UUHEdtColor.name, UUHEdtColor);

var UUHEdtSmile = {
  name : 'UUHEdtSmile',
  path : 'smile/',
  smiles : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
  buttons : {
    'smile' : {iconx : 1, icony : 5, name : 'Smile Face'}
  },
  onButtonClick : function(editor, pluginname, btnid, btnobj) {
    var smiles = this.smiles;
    var btn = this.buttons[btnid];
    var s = '<div title="'+btn.name+'" style="display:none;width:270px;"><div title=""><table CELLPADDING="0" CELLSPACING="0" BORDER="0"><tr><td><div style="width:270px;">'
    for(var g in smiles) {
      s += '<div style="cursor:pointer;height:18px;width:18px;float:left;"><div style="margin:1px;height:17px;width:17px;overflow:hidden;" onmouseover="this.style.backgroundColor=\'#000\';" onmouseout="this.style.backgroundColor=\'#fff\';" onmousedown="UUHEdts.onPopClick(event, this,\''+pluginname+'\',\''+btnid+'\',\''+smiles[g]+'\',\''+editor.id+'\');"><img src="'+UUHEdt_PATH+this.path+smiles[g]+'.gif'+'"></div></div>';
    }
    s += '</div></td></tr></table></div></div>';
    var status = '<input type="button" value="'+UUHEdts.lang('Cancel')+'" onclick="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'cancel\',\''+editor.id+'\');">';
    editor.openWin(btnobj, btn.name, s, false, false, status);
  },
  onPopClick : function(e, editor, pluginname, btnid, subbtnid, btnobj) {
    editor.closeWin();
    editor.setFocus();
    if(subbtnid != 'cancel') {
      var btn = this.buttons[btnid];
      editor.pasteHTML('<img src="'+UUHEdt_PATH+this.path+subbtnid+'.gif" />');
    }
  }
};
UUHEdts.addPlugin(UUHEdtSmile.name, UUHEdtSmile);

var UUHEdtChars = {
  name : 'UUHEdtChars',
  buttons : {
    'chars' : {iconx : 9, icony : 3, name : 'Custom Character'}
  },
  onButtonClick : function(editor, pluginname, btnid, btnobj) {
    var btn = this.buttons[btnid];
    var s = '<div title="'+btn.name+'" style="display:none;width:270px;"><div title=""><table CELLPADDING="0" CELLSPACING="0" BORDER="0"><tr><td><div style="width:270px;">'
    for (var g = 128; g < 255; g++) {
      if (g != 129 && g != 141 && g != 143 && g != 144 && g != 157 && g != 160) {
        s += '<div style="cursor:pointer;height:18px;width:18px;float:left;"><div style="margin:1px;height:17px;width:17px;overflow:hidden;" onmouseover="this.style.backgroundColor=\'#ccc\';" onmouseout="this.style.backgroundColor=\'#fff\';" onmousedown="UUHEdts.onPopClick(event, this,\''+pluginname+'\',\''+btnid+'\',\'&#'+g+';\',\''+editor.id+'\');">&#'+g+';</div></div>';
      }
    }
    s += '</div></td></tr></table></div></div>';
    var status = '<input type="button" value="'+UUHEdts.lang('Cancel')+'" onclick="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'cancel\',\''+editor.id+'\');">';
    editor.openWin(btnobj, btn.name, s, false, false, status);
  },
  onPopClick : function(e, editor, pluginname, btnid, subbtnid, btnobj) {
    editor.closeWin();
    editor.setFocus();
    if(subbtnid != 'cancel') {
      var btn = this.buttons[btnid];
      editor.pasteHTML(subbtnid);
    }
  }
};
UUHEdts.addPlugin(UUHEdtChars.name, UUHEdtChars);

var UUHEdtEditHtml = {
  name : 'UUHEdtEditHtml',
  buttons : {
    'html' : {iconx : 3, icony : 5, name : 'Edit HTML'}
  },
  onButtonClick : function(editor, pluginname, btnid, btnobj) {
    var btn = this.buttons[btnid];
    var s = '<div title="'+btn.name+'" style="display:none;width:460px;"><div title="">'
          + '<textarea id="'+editor.id+'_edht" style="height:100%;width:100%;"></textarea>'
          + '</div></div>';
    var status = '<input type="button" value="'+UUHEdts.lang('OK')+'" onclick="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'ok\',\''+editor.id+'\');">'
          + '<input type="button" value="'+UUHEdts.lang('Cancel')+'" onclick="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'cancel\',\''+editor.id+'\');">';
    var f = editor.getObject();
    editor.openWin(btnobj, btn.name, s, f.clientWidth-20, f.clientHeight, status, true);
    var o = document.getElementById(editor.id+'_edht');
    o.value = editor.getContent();
  },
  onPopClick : function(e, editor, pluginname, btnid, subbtnid, btnobj) {
    editor.closeWin();
    if(subbtnid == 'ok') {
      var o = document.getElementById(editor.id+'_edht');
      editor.setContent(o.value);
    }
  }
};
UUHEdts.addPlugin(UUHEdtEditHtml.name, UUHEdtEditHtml);

var UUHEdtPreview = {
  name : 'UUHEdtPreview',
  buttons : {
    'preview' : {iconx : 3, icony : 7, name : 'Preview'}
  },
  onButtonClick : function(editor, pluginname, btnid, btnobj) {
    var btn = this.buttons[btnid];
    var s = '<div title="'+btn.name+'" style="display:none;width:460px;"><div title="">'
          + '<iframe id="'+editor.id+'_view" style="height:100%;width:100%;scroll:auto;" frameborder="0"></iframe></div></div>';
    var f = editor.getObject();
    editor.openWin(btnobj, btn.name, s, f.clientWidth-20, f.clientHeight, '', true);
    var o = document.getElementById(editor.id+'_view');
    var fd = o.contentWindow.document;
    fd.open();
    fd.write('<html><head></head><body style="background-color:#fff;">'+editor.getContent()+'</body></html>');
    fd.close();
  }
};
UUHEdts.addPlugin(UUHEdtPreview.name, UUHEdtPreview);

var UUHEdtImage = {
  name : 'UUHEdtImage',
  buttons : {
    'image' : {iconx : 6, icony : 3, name : 'Edit Image'}
  },
  savedImg : null,
  onButtonClick : function(editor, pluginname, btnid, btnobj, extParam1) {
    this.savedImg = extParam1;
    var src = '';
    var alt = '';
    var b = '';
    var w = '';
    var h = '';
    var sv = '';
    var sh = '';
    var mo = '';
    var ag = '';

    if(extParam1 && extParam1.nodeName && extParam1.nodeName == 'IMG') {
    }
    else {
      var obj = editor.getSelectedElement();
      if(obj && obj.nodeName == 'IMG'){
        extParam1 = obj;
        this.savedImg = extParam1;
      }
      else{
        //like selected:<div><span><img src="..."></span></div>
        var s = editor.getSelHtml();
        if(s != '' && s.toLowerCase().indexOf('<img ') >= 0){
          var r = editor.getRng();
          if(r && r.startContainer && r.startContainer == r.endContainer) {
            var arr = r.startContainer.getElementsByTagName('img');
            if(arr && arr.length == 1) {
              extParam1 = arr[0];
              this.savedImg = arr[0];
            }
          }
        }
      }
    }
    if(extParam1 && extParam1.nodeName) {
      var o = this.savedImg;
      src = editor.processURL(o.src);
      var u0 = location.protocol + '//' + location.host;
      if(src.substring(0, u0.length) == u0) {
        src = src.substring(u0.length);
      }
      alt = o.title;
      if(o.width && o.width != ''){
        try{w = parseInt(o.width,10);}catch(e){};
        if(!w) w=0;
      }
      if(o.height && o.height != ''){
        try{h = parseInt(o.height,10);}catch(e){};
        if(!h) h=0;
      }
      if(o.border && o.border != ''){
        try{b = parseInt(o.border,10);}catch(e){};
        if(!b) b=0;
      }
      if(o.onmouseover && o.onmouseout){
        var s1 = ''+o.onmouseover;
        var s2 = new RegExp('src\\s*=\\s*\'([^ >\"]*)\'', 'gi').exec(s1);
        var s3 = new RegExp('src\\s*=\\s*\"([^ >\"]*)\"', 'gi').exec(s1);
        if(s2 != null && s2.length > 1){
          mo = s2[1];
        }
        else if(s3 != null && s3.length > 1){
          mo = s3[1];
        }

        s1 = ''+o.onmouseout;
        s2 = new RegExp('src\\s*=\\s*\'([^ >\"]*)\'', 'gi').exec(s1);
        s3 = new RegExp('src\\s*=\\s*\"([^ >\"]*)\"', 'gi').exec(s1);
        if(s2 != null && s2.length > 1){
          src = s2[1];
        }
        else if(s3 != null && s3.length > 1){
          src = s3[1];
        }
      }
      var mg = o.style.margin;
      if(mg != ''){
        var ar = mg.split(' ');
        if(ar.length == 1){
          try{sv = parseInt(ar[0],10);}catch(e){};
          try{sh = parseInt(ar[0],10);}catch(e){};
        }
        else if(ar.length == 2 || ar.length == 4){
          try{sv = parseInt(ar[0],10);}catch(e){};
          try{sh = parseInt(ar[1],10);}catch(e){};
        }
        if(!sv) sv=0;
        if(!sh) sh=0;
      }
      ag = (o.style.styleFloat || o.style.cssFloat);
      if(!ag || ag == ''){
        ag = o.style.verticalAlign;
      }
      if(!ag){
        ag = '';
      }
    }

    var ar = {'':'Not set', 'left':'Left', 'right':'Right', 'baseline':'Baseline', 'bottom':'Bottom', 'middle':'Middle', 'top':'Top'};
    var sel = '<select size="1" id="sftab_align">';
    for(ao in ar){
      var ck = (ao==ag) ? ' selected': '';
      sel += '<option value="'+ao+'"'+ck+'>'+ar[ao]+'</option>';
    }
    sel += '</select>';
 
    var btn = this.buttons[btnid];
    var s = '<div title="'+btn.name+'" style="display:none;width:460px;"><div title="">'
    + '<table border="0" width="100%" style="padding: 0px; margin: 0px">'
    + '<tr><td>Image URL:</td><td><input type="text" id="sftab_url" style="width:280px" value="'+src+'" />'
    + '<input type="button" value="Browser" onclick="UUHEdtImage.onBrowserClick(\''+editor.id+'\',\'sftab_url\');"></td></tr>'
    + '<tr><td>Alternate:</td><td><input type="text" id="sftab_alt" style="width:280px" value="'+alt+'" /></td></tr>'
    + '<tr><td>Alignment:</td><td>' + sel + '</td></tr>'
    + '<tr><td>Border:</td><td><input type="text" value="'+b+'" id="sftab_border" size="5" /></td></tr>'
    + '<tr><td>Space:</td><td><input type="text" value="'+sh+'" id="sftab_horiz" size="5" />(Horizontal) x '
    + '<input type="text" value="'+sv+'" id="sftab_vert" size="5" />(Vertical) px</td></tr>'
    + '<tr><td>Size:</td><td><input id="sftab_w" value="'+w+'" size="5" maxlength="5" type="text">(width) x '
    + '<input id="sftab_h" value="'+h+'" size="5" maxlength="5" type="text">(height) px</td></tr>'
    + '<tr><td>Image URL:</td><td><input type="text" value="'+mo+'" id="sftab_url2" style="width:280px" />'
    + '<input type="button" onclick="UUHEdtImage.onBrowserClick(\''+editor.id+'\',\'sftab_url2\');" value="Browser"><br>(while mouse over)</table>'
    + '</div></div>';
    var status = '<input type="button" value="'+UUHEdts.lang('OK')+'" onclick="UUHEdtImage.onPopClick(\''+editor.id+'\',\'ok\');">'
    + '<input type="button" value="'+UUHEdts.lang('Cancel')+'" onclick="UUHEdtImage.onPopClick(\''+editor.id+'\',\'cancel\');">';
    editor.openWin(btnobj, btn.name, s, 460, false, status);
  },
  onBrowserClick : function(editorid, des_id) {
    alert('you should overwrite UUHEdtImage.onBrowserClick = function(editorid, des_id) {...}, des_id:'+des_id);
  },
  onPopClick : function(editorid, act) {
    var editor = UUHEdts.getEditor(editorid);
    if(act == 'ok') {
      var url = document.getElementById('sftab_url').value;
      if(url != ''){
        var url2 = document.getElementById('sftab_url2').value;
        var w = 0;
        var h = 0;
        var b = 0;
        var sv = 0;
        var sh = 0;
        try{w = parseInt(document.getElementById('sftab_w').value,10);}catch(e){};
        try{h = parseInt(document.getElementById('sftab_h').value,10);}catch(e){};
        try{b = parseInt(document.getElementById('sftab_border').value,10);}catch(e){};
        try{sv = parseInt(document.getElementById('sftab_vert').value,10);}catch(e){};
        try{sh = parseInt(document.getElementById('sftab_horiz').value,10);}catch(e){};
        if(!w) w=0;
        if(!h) h=0;
        if(!b) b=0;
        if(!sv) sv=0;
        if(!sh) sh=0;

        var title = document.getElementById('sftab_alt').value;
        title = title.replace(/"/g, '');
        var u0 = location.protocol + '//' + location.host;
        if(url.substring(0, u0.length) == u0) {
          url = url.substring(u0.length);
        }

        var s = '<img src="'+url+'"';
        if(url.substring(url.length - 4).toLowerCase() == '.swf'){
          s = '<object><param name="movie" value="'+url+'">';
          s += '<embed src="'+url+'" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash"';
          if(navigator.userAgent.indexOf('Firefox') >= 0) {
            alert('Object of flash is added, but is not shown in editing time.');
          }
        }

        if(title != '') s += ' title="'+title+'"';
        if(w > 0) s += ' width="'+w+'"';
        if(h > 0) s += ' height="'+h+'"';
        if(b >= 0) s += ' border="'+b+'"';
        if(url2 != '') s += ' onmouseover="this.src=\''+url2+'\'" onmouseout="this.src=\''+url+'\'"';

        var ag = document.getElementById('sftab_align').value;
        if(ag == 'right' || ag == 'left'){
          ag = 'float:'+ag+';';
        }
        else if(ag != ''){
          ag = 'vertical-align:'+ag+';';
        }
        if(sh > 0 || sv > 0) s += ' style="'+ag+'margin:'+sv+'px '+sh+'px;"';
        else if(ag != '') s += ' style="'+ag+'"';

        s += '>';
        if(url.substring(url.length - 4).toLowerCase() == '.swf'){
          s += '</embed></object>';
        }

        if(this.savedImg && this.savedImg.outerHTML) {
          this.savedImg.outerHTML = s;
        }
        else {
          editor.pasteHTML(s);
        }
      }
    }
    editor.closeWin();
    editor.setFocus();
  }
};
UUHEdts.addPlugin(UUHEdtImage.name, UUHEdtImage);

var UUHEdtTable = {
  name : 'UUHEdtTable',
  buttons : {
    'table' : {iconx : 6, icony : 2, name : 'Edit Table'}
  },
  onButtonClick : function(editor, pluginname, btnid, btnobj, dbClickObject) {
    var s = editor.getSelHtml();
    var col = '2';
    var row = '2';
    var cellp = '0';
    var cells = '0';
    var b = '';
    var w = '';
    var h = '';
    var ag = '';
    var dis = '';
    var caption = '';
    var bc = '';
    var bgc = '';
    var ss = s.toLowerCase();
    this.selectedElement = null;
    if(ss.substring(0, 7) == '<table ' && ss.substring(ss.length-1) == '>'){
      //save selected obj for edit
      var obj = editor.getSelectedElement();
      if(obj && obj.tagName.toLowerCase() == 'table' && obj.rows.length > 0){
        this.selectedElement = obj;
        var o = obj;
        row = o.rows.length;
        if(row > 0){
          col = o.rows[0].cells.length;
          dis = ' disabled="disabled"'
        }
        if(o.style.width != ''){
          try{w = parseInt(o.style.width,10);}catch(e){};
        }
        if(o.style.height != ''){
          try{h = parseInt(o.style.height,10);}catch(e){};
        }
        if(o.border && o.border != ''){
          try{b = parseInt(o.border,10);}catch(e){};
        }
        if(!w) w=0;
        if(!h) h=0;
        if(!b) b=0;
        ag = o.align;
        cellp = o.cellPadding;
        cells = o.cellSpacing;
        if(o.style.borderColor){
          bc = o.style.borderColor;
          bc = UUHEdts.color2hex(bc);
        }
        else{
          if(o.style.border.toLowerCase().indexOf('rgb(') >= 0 || o.style.border.indexOf('#') >= 0){
            bc = UUHEdts.color2hex(o.style.border);
          }
        }
        bgc = o.style.backgroundColor;
        bgc = UUHEdts.color2hex(bgc);
        if(o.caption) caption = ' checked';
      }
    }
    var ar = {'':'Not set', 'center':'Center', 'left':'Left', 'right':'Right'};
    var sel = '<select size="1" id="sftab_align">';
    for(ao in ar){
      var ck = (ao==ag) ? ' selected': '';
      sel += '<option value="'+ao+'"'+ck+'>'+ar[ao]+'</option>';
    }
    sel += '</select>';
 
    var btn = this.buttons[btnid];
    var s = '<div title="'+btn.name+'" style="display:none;width:420px;"><div title="">'
    + '<table border="0" cellpadding="4" cellspacing="0" width="100%">'
    + '<tr><td>Cols</td><td><input id="sftab_cols" value="' + col + '" '+dis+'size="3" maxlength="3" type="text"></td><td>Rows</td><td><input id="sftab_rows" value="' + row + '" '+dis+'size="3" maxlength="3" type="text"></td></tr>'
    + '<tr><td>Cellpadding</td><td><input id="sftab_cp" value="' + cellp + '" size="3" maxlength="3" type="text"></td><td>Cellspacing</td><td><input id="sftab_cs" value="' + cells + '" size="3" maxlength="3" type="text"></td></tr>'
    + '<tr><td>Alignment</td><td>' + sel + '</td><td>Border</td><td><input id="sftab_border" value="' + b + '" size="3" maxlength="3" type="text"></td></tr>'
    + '<tr><td>Width</td><td><input id="sftab_w" value="' + w + '" size="4" maxlength="4" type="text"></td><td>Height</td><td><input id="sftab_h" value="' + h + '" size="4" maxlength="4" type="text"></td></tr>'
    + '<tr><td>Table caption</td><td><input id="sftab_caption" value="true" type="checkbox" '+caption+'></td></tr>'
    + '<tr><td>Border color</td><td><input id="sftab_bc" value="'+bc+'" size="9" type="text"><input type="button" value="..." onclick="javascript:UUHEdtTable.pickColor(\''+editor.id+'\',\'sftab_bc\');" title="Browse"></td></tr>'
    + '<tr><td>Background color</td><td><input id="sftab_bgc" value="'+bgc+'" size="9" type="text"><input type="button" value="..." onclick="javascript:UUHEdtTable.pickColor(\''+editor.id+'\',\'sftab_bgc\');" title="Browse"></td> </tr>'
    + '</table>'
    + '</div></div>';
    var status = '<input type="button" value="'+UUHEdts.lang('OK')+'" onclick="UUHEdtTable.onPopClick(\''+editor.id+'\',\'ok\');">'
    + '<input type="button" value="'+UUHEdts.lang('Cancel')+'" onclick="UUHEdtTable.onPopClick(\''+editor.id+'\',\'cancel\');">';
    editor.openWin(btnobj, btn.name, s, 420, false, status);
  },
  pickColor : function(editorid, inputid) {
    var editor = UUHEdts.getEditor(editorid);
    UUHEdtColor.pickColor(editor, inputid);
  },
  onPopClick : function(editorid, act) {
    var editor = UUHEdts.getEditor(editorid);
    if(act == 'ok') {
      var col = 0;
      var row = 0;
      try{col = parseInt(document.getElementById('sftab_cols').value,10);}catch(e){};
      try{row = parseInt(document.getElementById('sftab_rows').value,10);}catch(e){};
      if(!col) col=0;
      if(!row) row=0;
      if(col > 0 && row > 0){
        var w = 0;
        var h = 0;
        var b = 0;
        try{w = parseInt(document.getElementById('sftab_w').value,10);}catch(e){};
        try{h = parseInt(document.getElementById('sftab_h').value,10);}catch(e){};
        try{b = parseInt(document.getElementById('sftab_border').value,10);}catch(e){};
        if(!w) w=0;
        if(!h) h=0;
        if(!b) b=0;

        var cellp = 0;
        var cells = 0;
        try{cellp = parseInt(document.getElementById('sftab_cp').value,10);}catch(e){};
        try{cells = parseInt(document.getElementById('sftab_cs').value,10);}catch(e){};
        if(!cellp) cellp=0;
        if(!cells) cells=0;

        var bb = '';
        if(b <= 0){
          bb = "border:1px dotted '+bc+';";
        }
        //else bb = 'border:'+b+"px solid #000;";
        var bc = document.getElementById('sftab_bc').value;
        if(bc == '') bc = 'gray';
        var bgc = document.getElementById('sftab_bgc').value;

        var caption = document.getElementById('sftab_caption').checked;
        var al = document.getElementById('sftab_align').value;

        //<table cellspacing="4" cellpadding="3" style="border: 0pt solid #333333; background-color: #d7467d; width: 277px; height: 38px;" border="0"><caption style="text-align: left;">aaaaaaa</caption><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>
        var s = '<table';
        s += ' border="'+b+'"';
        s += ' cellspacing="'+cellp+'"';
        s += ' cellpadding="'+cells+'"';
        if(al != '') s += ' align="'+al+'"';
        var st = '';
        if(w > 0) st += 'width:'+w+'px;';
        if(h > 0) st += 'height:'+h+'px;';
        if(b <= 0) st += 'border:1px dotted '+bc+';';
        else  st += 'border:'+b+'px solid '+bc+';';
        if(bgc != '') st += 'background-color:'+bgc+';';
        if(st != '') s += ' style="'+st+'"';
        s += '>';

        if(caption) s += '<caption></caption>';
        var tdb = '';
        if(b <= 0) tdb += ' style="border:1px dotted '+bc+';"';
        for(var i = 0; i < row; i++){
          s += '<tr>';
          for(var j = 0; j < col; j++){
            s += '<td'+tdb+'>&nbsp;</td>';
          }
          s += '</tr>';
        }
        s += '</table>';
        var dis = document.getElementById('sftab_rows').disabled;
        if(dis && this.selectedElement){
          //edit table
          var o = this.selectedElement;
          o.cellPadding = cellp;
          o.cellSpacing = cells;
          o.border = b;
          o.align = al;
          o.style.width = w+'px';
          o.style.height = h+'px';
          if(b <= 0) o.style.border = '1px dotted '+bc+'';
          else  o.style.border = b+'px solid '+bc;
          o.style.backgroundColor = bgc;
          if(o.caption && !caption){
            o.deleteCaption();
          }
          if(!o.caption && caption){
            var t = o.createCaption();
            t.innerHTML="Caption";
          }
        }
        else{
          editor.pasteHTML(s);
        }
      }
    }
    editor.closeWin();
    editor.setFocus();
  }
};
UUHEdts.addPlugin(UUHEdtTable.name, UUHEdtTable);

var UUHEdtLink = {
  name : 'UUHEdtLink',
  buttons : {
    'link' : {iconx : 6, icony : 1, name : 'Edit Link'},
    'unlink' : {iconx : 2, icony : 5, name : 'UnLink'}
  },
  onButtonClick : function(editor, pluginname, btnid, btnobj, dbClickObject) {
    this.selectedElement = null;
    if(btnid == 'unlink'){
      //editor.select(editor.getNode());
      editor.execCommand('unlink', null);
    }
    else{
      //save selected obj for edit
      var obj = editor.getSelLink();
      if(obj && obj.tagName && obj.tagName.toLowerCase() == 'a') {
      }
      else {
        obj = editor.getSelectedElement();
      }
      if(obj && obj.tagName && obj.tagName.toLowerCase() == 'img'){
        if(obj.parentNode && obj.parentNode.tagName.toLowerCase() == 'a'){
          obj = obj.parentNode;
        }
      }
      var s = editor.getSelHtml();
      if(s == '') {
        alert(UUHEdts.lang('CM-SelCont'));
        return;
      }
      var src = '';
      var tar1 = '';
      var tar2 = '';
      var tar3 = '';
      var title = '';
      if(obj && obj.tagName && obj.tagName.toLowerCase() == 'a'){
        this.selectedElement = obj;
        src = editor.processURL(obj.href);
        var u0 = location.protocol + '//' + location.host;
        if(src.substring(0, u0.length) == u0) {
          src = src.substring(u0.length);
        }
        if(obj.target == '_blank') {
          tar1 = ' selected';
        }
        else if(obj.target == '_parent') {
          tar2 = ' selected';
        }
        else if(obj.target == '_top') {
          tar3 = ' selected';
        }
        title = '';
        if(obj.title) {
          title = obj.title;
        }
        else if(obj.alt) {
          title = obj.alt;
        }
      }

      var btn = this.buttons[btnid];
      var sftab_purl = src;
      var sftab_pname = '';
      var sftab_pw = '';
      var sftab_ph = '';
      var sftab_pl = '';
      var sftab_pt = '';
      var sftab_plocation = '';
      var sftab_pscrollbar = '';
      var sftab_pmenubar = '';
      var sftab_presizable = '';
      var sftab_ptoolbar = '';
      var sftab_pstatus = '';
      if(src && src.indexOf('window.open(\'') > 0) {
        var f = function(s, key, end) {
          var ind = s.indexOf(key);
          if(ind >= 0) {
            var ind2 = s.indexOf(end, ind + key.length);
            if(ind2 >= 0) {
              return s.substring(ind + key.length, ind2);
            }
          }
          return '';
        }
        //javascript:void window.open('index.php?task=down&fileid=lKSmojHIlrrW2AOYhkYoIIIk34kOwV37','aaaa','location=on,scrollbars=on,menubar=on,resizable=on,toolbar=on,status=on,width=11,height=22,left=33,top=44,');
        var ind1 = src.indexOf('window.open(\'');
        var ind2 = src.indexOf('\'', ind1 + 13);
        sftab_purl = src.substring(ind1 + 13, ind2);
        src2 = src.substring(ind2+1);
        sftab_pname =  f(src2, ",'", "','");
        sftab_pw = f(src2, 'width=', ',');
        sftab_ph = f(src2, 'height=', ',');
        sftab_pl = f(src2, 'left=', ',');
        sftab_pt = f(src2, 'top=', ',');

        sftab_plocation = (src.indexOf('location=on') > 0 ? ' checked' : '');
        sftab_pscrollbar = (src.indexOf('scrollbars=on') > 0 ? ' checked' : '');
        sftab_pmenubar = (src.indexOf('menubar=on') > 0 ? ' checked' : '');
        sftab_presizable = (src.indexOf('resizable=on') > 0 ? ' checked' : '');
        sftab_ptoolbar = (src.indexOf('toolbar=on') > 0 ? ' checked' : '');
        sftab_pstatus = (src.indexOf('status=on') > 0 ? ' checked' : '');
      }
      var s = '<div title="'+btn.name+'" style="display:none;width:380px;">'
        + '<div title="'+UUHEdts.lang('General Link')+'">'
        + '<table CELLPADDING="0" CELLSPACING="0" BORDER="0"><tr><td>Link URL:</td><td><input style="width: 260px;" id="sftab_href" value="'+src+'" type="text"></td></tr><tr><td>Target:</td><td><select id="sftab_target" style="width: 260px;"><option value="_self">Open in this window / frame</option><option value="_blank"'+tar1+'>Open in new window (_blank)</option><option value="_parent"'+tar2+'>Open in parent window / frame (_parent)</option><option value="_top"'+tar3+'>Open in top frame (replaces all frames) (_top)</option></select></td></tr><tr><td>Title:</td><td><input id="sftab_title" style="width: 260px;" value="'+title+'" type="text"></td</tr></table>'
        + '</div>'
        + '<div title="'+UUHEdts.lang('Javascript popup Link')+'">'
        + '<table CELLPADDING="0" CELLSPACING="0" BORDER="0"><tr><td>Popup URL:</td><td><input style="width: 260px;" id="sftab_purl" value="'+sftab_purl+'" type="text"></td></tr>'
        + '<tr><td>Window name:</td><td><input id="sftab_pname" style="width: 260px;" value="'+sftab_pname+'" type="text"></td></tr>'
        + '<tr><td>Title:</td><td><input id="sftab_title2" style="width: 260px;" value="'+title+'" type="text"></td></tr>'
        + '<tr><td>Size:</td><td><input id="sftab_pw" style="width: 40px;" value="'+sftab_pw+'" type="text">(width) x <input id="sftab_ph" style="width: 40px;" value="'+sftab_ph+'" type="text">(height) px</td></tr>'
        + '<tr><td>Position:</td><td><input id="sftab_pl" style="width: 40px;" value="'+sftab_pl+'" type="text">(X) / <input id="sftab_pt" style="width: 40px;" value="'+sftab_pt+'" type="text">(Y) (c/c = center)</td></tr></table>'
        + '<input id="sftab_plocation" type="checkbox"'+sftab_plocation+'><label for="sftab_plocation">Show location bar</label><br>'
        + '<input id="sftab_pscrollbar" type="checkbox"'+sftab_pscrollbar+'><label for="sftab_pscrollbar">Show scrollbars</label><br>'
        + '<input id="sftab_pmenubar" type="checkbox"'+sftab_pmenubar+'><label for="sftab_pmenubar">Show menu bar</label><br>'
        + '<input id="sftab_presizable" type="checkbox"'+sftab_presizable+'><label for="sftab_presizable">Make window resizable</label><br>'
        + '<input id="sftab_ptoolbar" type="checkbox"'+sftab_ptoolbar+'><label for="sftab_ptoolbar">Show toolbars</label><br>'
        + '<input id="sftab_pstatus" type="checkbox"'+sftab_pstatus+'><label for="sftab_pstatus">Show status bar</label>'
        + '</div>'
        + '</div>';
      var status = '<input type="button" value="'+UUHEdts.lang('OK')+'" onclick="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'ok\',\''+editor.id+'\');">'
        + '<input type="button" value="'+UUHEdts.lang('Cancel')+'" onclick="UUHEdts.onPopClick(event, this,\''+this.name+'\',\''+btnid+'\',\'cancel\',\''+editor.id+'\');">';
      editor.openWin(btnobj, btn.name, s, 380, false, status);
      document.getElementById('sftab_href').focus();
    }
  },
  onPopClick : function(e, editor, pluginname, btnid, subbtnid, btnobj) {
    if(subbtnid == 'ok') {
      editor.execCommand('unlink', null);

      function of(id){var v = document.getElementById(id).checked;
        return v ? 'on' : 'off';
      };
      var ind = editor.getWinPage();
      editor.closeWin();
      editor.setFocus();
      if(ind == 1) {
        var url = document.getElementById('sftab_purl').value;
        var u0 = location.protocol + '//' + location.host;
        if(url.substring(0, u0.length) == u0) {
          url = url.substring(u0.length);
        }
        var nm = document.getElementById('sftab_pname').value;
        var w = 0;
        var h = 0;
        var l = document.getElementById('sftab_pl').value;
        var t = document.getElementById('sftab_pt').value;
        try{w = parseInt(document.getElementById('sftab_pw').value,10);}catch(e){};
        try{h = parseInt(document.getElementById('sftab_ph').value,10);}catch(e){};
        var l2 = 0;
        var t2 = 0;
        try{l2 = parseInt(l,10);}catch(e){};
        try{t2 = parseInt(t,10);}catch(e){};
        var s = '';
        s += 'location='+of('sftab_plocation')+',';
        s += 'scrollbars='+of('sftab_pscrollbar')+',';
        s += 'menubar='+of('sftab_pmenubar')+',';
        s += 'resizable='+of('sftab_presizable')+',';
        s += 'toolbar='+of('sftab_ptoolbar')+',';
        s += 'status='+of('sftab_pstatus')+',';
        if(w > 0){
          s += 'width='+w+',';
        }
        if(h > 0){
          s += 'height='+h+',';
        }
        if(l.toLowerCase()=='c' && t.toLowerCase()=='c' && w > 0 && h > 0){
          s += 'left=\'+(window.screen.width-'+w+')/2+\',top=\'+(window.screen.height-'+h+')/2+\',';
        }
        else{
          if(l != ''){
            s += 'left='+l2+',';
          }
          if(t != ''){
            s += 'top='+t2+',';
          }
        }
        var u = "javascript:void window.open('"+url+"','"+nm+"','"+s+"');";

        var title = document.getElementById('sftab_title2').value;
        title = title.replace(/"/g, '');
        if(title != '') title = ' title="'+title+'"';

        var r = editor.getSelHtml();
        if(r == '') r = url;
        s = '<a href="'+u+'"'+title+'>'+r+'</a>';
        editor.pasteHTML(s);
      }
      else {
        var url = document.getElementById('sftab_href').value;
        var target = document.getElementById('sftab_target').value;
        var title = document.getElementById('sftab_title').value;
        title = title.replace(/"/g, '');
        if(title != '') title = ' title="'+title+'"';

        var r = editor.getSelHtml();
        if(r == '') r = url;
        var s = '<a href="'+url+'" target="'+target+'"'+title+'>'+r+'</a>';
        editor.pasteHTML(s);
      }
    }
    else{
      editor.closeWin();
      editor.setFocus();
    }
  }
};
UUHEdts.addPlugin(UUHEdtLink.name, UUHEdtLink);

//main class for UUHEdt
function UUHEdt(id, options)
{
  if(!options) options = [];
  if(!id || id == '') id = 'g_UUHEdt_Element';
  var oMain = o(id);
  if(oMain == null || typeof(oMain) != 'object')
  {
    oMain = document.createElement('div');
    oMain.id = id;
    document.body.appendChild(oMain);
  }
  if(typeof(oMain.objSelf) == 'object' && oMain.m_id == id) return oMain.objSelf;
  if(oMain.m_id != id || oMain.objCreated != 1)
  {
    oMain.id = id;
    oMain.m_id = id;
    oMain.objCreated = 1;
    oMain.objSelf = new UUHEdt(id, options);
    return oMain.objSelf;
  }

  oMain.m_opt = options;
  oMain.m_ifrm = null;
  oMain.m_doc = null;
  this.id = id;

  //init,not show until show()
  init(id);

  //private function
  function o(id,o){if(!o)o=document;return o.getElementById(id);}
  function init(id)
  {
    UUHEdts.initLang(false);
    if(oMain.m_opt._noeditor) {
      return;
    }
    var s = '<table id="'+oMain.id+'_pp" style="margin:0px;padding:0px;height:100%;width:100%;" border="0" cellpadding="0" cellspacing="0"><tr><td style="height:0px;width:100%;margin:0px;padding:0px;border:1px solid #ccc;" valign="top">'
          +'<div id="'+oMain.id+'_p"></div></td></tr><tr><td style="margin:0px;padding:0px;height:100%;width:100%;border:1px solid #ccc;">'
          +'<iframe id="'+oMain.id+'_ifrm" style="height:0px;width:100%;" marginWidth=0 marginHeight=0 allowTransparency="true" scrolling="auto" frameborder=0></iframe></td></tr></table>';
    oMain.innerHTML = s;
    oMain.m_ifrm = o(id+'_ifrm');
    oMain.m_win = oMain.m_ifrm.contentWindow;
    reset();
    setPanel();
    if(typeof(oMain.m_opt.height) != 'string' || oMain.m_opt.height == '') {
      if(oMain.style.height != '') {
        oMain.m_opt.height = oMain.style.height;
      }
      else {
        oMain.m_opt.height = '100%';
      }
    }
    setHeight(oMain.m_opt.height);
  }
  function initEvent()
  {
    oMain.m_win = oMain.m_ifrm.contentWindow;
    UUHEdts.addEvent(oMain.m_win, 'blur', onBlur);
    UUHEdts.addEvent(oMain.m_win, 'focus', onFocus);
    UUHEdts.addEvent(oMain.m_doc, 'mousedown', onMDown);
    UUHEdts.addEvent(oMain.m_win, 'dblclick', onDblClick);
    if(UUHEdt_MSIE) {
      UUHEdts.addEvent(oMain.m_doc, 'keydown', onKeydown);
      UUHEdts.addEvent(oMain.m_doc, 'beforedeactivate', onBeforedeactivate);
    }
  }

  this.reset = reset;
  function reset()
  {
    var s = '';
    if(oMain.m_doc && oMain.m_doc.body) {
      s = oMain.m_doc.body.innerHTML;
    }
    var fd = oMain.m_ifrm.contentDocument || oMain.m_ifrm.contentWindow.document;
    fd.designMode = "On";
    fd.open();
    fd.write('<html><head></head><body style="margin: 0 !important; background-color: transparent !important;width:100%;height:100%;"><br></body></html>');
    fd.close();
    oMain.m_doc = fd;
    //oMain.m_ifrm.focus();
    //oMain.m_win.focus();
    fd.body.innerHTML = (s == '' ? '<br>' : s);
    initEvent();
  }

  //if is % then set only for iframe,but if is nubmer then for all height of editor(with toolbar)
  this.setHeight = setHeight;
  function setHeight(h)
  {
    var pp = document.getElementById(oMain.id+'_pp');
    if(h.substring(h.length-1) == '%') {
       oMain.m_ifrm.style.height = '100%';
       pp.style.height = '100%';
    }
    else if(h.substring(h.length-2).toLowerCase() == 'px') {
      var hh = 0 + h.substring(0, h.length-2);
      var p = document.getElementById(oMain.id+'_p');
      var ifrm = document.getElementById(oMain.id+'_ifrm');
      ifrm.style.height = (hh - p.clientHeight - 6) + 'px';
      pp.style.height = h;
      oMain.style.height = h;
    }
  }

  function arrayIndexOf(arr, item){
    for(var i=arr.length-1;i>=0;i--) {
      if(arr[i] == item) {
        return i;
      }
    }
    return -1;
  }
  function onDblClick(e)
  {
    e = e || window.event;
    var tg = e.srcElement || e.target;
    var r = UUHEdts.userEditorDblClick(e, oMain.objSelf, tg);
    if(typeof(r) == 'number' && r < 0) return;
    var tgname = tg.nodeName.toUpperCase();
    if(tgname == 'IMG'){
      if(typeof(oMain.m_opt.buttons) != 'object' || oMain.m_opt.buttons.length <= 0 || arrayIndexOf(oMain.m_opt.buttons, 'image')>=0){
        UUHEdtImage.onButtonClick(oMain.objSelf, 'UUHEdtImage', 'image', null, tg);
      }
    }
    else if(tgname == 'TABLE'){
      if(typeof(oMain.m_opt.buttons) != 'object' || oMain.m_opt.buttons.length <= 0 || arrayIndexOf(oMain.m_opt.buttons, 'table')>=0){
        UUHEdtTable.onButtonClick(oMain.objSelf, 'UUHEdtTable', 'table', null, tg);
      }
    }
    else if(tgname == 'A'){
      if(typeof(oMain.m_opt.buttons) != 'object' || oMain.m_opt.buttons.length <= 0 || arrayIndexOf(oMain.m_opt.buttons, 'link')>=0){
        UUHEdtLink.onButtonClick(oMain.objSelf, 'UUHEdtLink', 'link', null, tg);
      }
    }
  }
  function onKeydown(e)
  {
    e = e || window.event;
    if(UUHEdt_MSIE && e.keyCode == 13) {
      var rng = oMain.m_doc.selection.createRange();
      if (rng.item) rng.item(0).outerHTML = '<BR>';
      else rng.pasteHTML('<BR>');
      e.returnValue = false;
      e.cancelBubble = true;
   }
  }
  //save/restore sel
  oMain.m_focus = false;
  //oMain.m_bm = null;
  //for only ie
  oMain.m_range = null;
  function onBlur(e)
  {
    oMain.m_focus = false;
  }
  function onBeforedeactivate(e)
  {
    oMain.m_range = oMain.m_doc.selection.createRange();
    //if(oMain.m_doc.selection.type != 'Control') oMain.m_bm = oMain.m_range.getBookmark();
    //else oMain.m_bm = null;
    oMain.m_focus = false;
  }
  this.onMDown = onMDown;
  function onMDown(e)
  {
    oMain.m_focus = true;
    //oMain.m_bm = null;
  }
  this.onFocus = onFocus;
  function onFocus(e)
  {
    if(UUHEdt_MSIE && !oMain.m_focus){
      var range = (oMain.m_range || oMain.m_doc.selection.createRange());
      //range.moveToElementText(oMain.m_doc.body);
      //range.collapse(false);
      ////range.moveToBookmark(oMain.m_bm);
      range.select();
      oMain.m_focus = true;
    }
    //oMain.m_bm = null;
    oMain.m_range = null;
  }
  this.isFocus = isFocus;
  function isFocus(e)
  {
    return oMain.m_focus;
  }

  this.setPanel = setPanel;
  function setPanel(pid)
  {
    if(typeof(pid) != 'string' || pid == ''){
      if(typeof(oMain.m_opt.panel) != 'string' || oMain.m_opt.panel == '') pid = id+'_p';
      else pid = oMain.m_opt.panel;
    }
    oMain.m_p = document.getElementById(pid);
    var s = '';
    if(typeof(oMain.m_opt.buttons) == 'object' && oMain.m_opt.buttons.length > 0){
      for(btn in oMain.m_opt.buttons) {
        for(pluginname in UUHEdts.m_plugins) {
          s += createPanel(pluginname, UUHEdts.m_plugins[pluginname].buttons, oMain.m_opt.buttons[btn]);
        }
      }
    }
    else{
      for(pluginname in UUHEdts.m_plugins) {
        s += createPanel(pluginname, UUHEdts.m_plugins[pluginname].buttons);
      }
    }
    oMain.m_p.innerHTML = s;
  }

  this.createPanel = createPanel;
  function createPanel(pluginname, btns, onebutton)
  {
    return createPanelPrivate('', pluginname, btns, '', onebutton);
  }
  //this.createSubPanel = createSubPanel;
  //function createSubPanel(info, pluginname, btns, parentbtnid)
  //{
  //  return createPanelPrivate(info, pluginname, btns, parentbtnid);
  //}
  function createPanelPrivate(info, pluginname, btns, parentbtnid, onebutton)
  {
    var s = '';
    if(info && info != '')
      s = '<span style="float:left;margin:0 1px;"><span class="buttonContain" style="height:20px;">'+info+'</span></span>';
    for(iconName in btns) {
      if(typeof(onebutton) == 'string' && iconName != onebutton) continue;

      var obtn = btns[iconName];
      if(iconName == '|') {
        s += '<span style="float:left;margin:0 1px;"><span class="buttonContain" style="width:2px;height:20px;"></span></span>';
      }
      else if(iconName == '-') {
        s += '<br style="clear:both;">';
      }
      else if(obtn.selitems) {
        s += '<span style="margin:1px 1px 0px 1px;"><span class="buttonContain" style="height:20px;">'
          +  '<select onchange="UUHEdts.onSelectedChanged(this,\''+pluginname+'\',\''+iconName+'\',\''+oMain.id+'\');" style="height:20px;font-size:9pt;">';
        for(selitem in obtn.selitems) {
          s += '<option value="'+selitem+'">'+obtn.selitems[selitem]+'</option>';
        }
        s += '</select></span></span>';
      }
      else {
        var pid = (parentbtnid && parentbtnid != '') ? parentbtnid : iconName;
        var lab = '';
        var labw = 'width:18px;';
        if(obtn.label) {
          lab = obtn.label;
          labw = '';
        }
        s += '<span style="margin-top:2px;">'
          +  '<span style="width:20px;height:20px;background-color:#efefef;border:1px solid #efefef;display:inline-block;" onmouseover="this.style.backgroundColor=\'#cccccc\';this.style.border=\'1px solid #000000\';" onmouseout="this.style.backgroundColor=\'#efefef\';this.style.border=\'1px solid #efefef\';">'
          +  '<input type="button" class="button" title="'+(obtn.tips ? obtn.tips : obtn.name)+'" onclick="UUHEdts.onButtonClick(this,\''+pluginname+'\',\''+pid+'\',\''+iconName+'\',\''+oMain.id+'\');" value="'+lab+'" '
          +  'style="'+labw+'height:18px;overflow:hidden;zoom:1;curso:pointer;border:0;margin: 0 !important; background-color: transparent !important;'
          + getIcon(obtn, UUHEdts.m_plugins[pluginname], oMain.m_opt)+'"></span></span>';
      }
    }
    return s;
  }
  function getIcon(btn, plugin, options) {
    var ipath = (options && options.iconsPath) ? options.iconsPath : UUHEdt_PATH;
    if(btn.iconFile) {
      return 'background-image:url('+ipath+btn.iconFile+') ;background-repeat: no-repeat;';
    }
    if(typeof(btn.iconx) != 'number' || typeof(btn.icony) != 'number') return '';
    var ifile = (options && options.iconsFile) ? options.iconsFile : (plugin.iconsFile ? plugin.iconsFile : UUHEdts.m_iconsFile);
    return 'background-image:url('+ipath+ifile+');background-position:'+((btn.iconx+1) * -18)+'px '+((btn.icony+1) * -18)+'px;';
  }

  this.getObject = function()
  {
    return oMain;
  }
  this.setContent = function(s)
  {
    if(!s || s == '') s = '<br>';
    oMain.m_win.document.body.innerHTML = s;
  }
  this.getContent = function()
  {
    function change(s){
      if(s.substring(0, 2) == '</'){
        return s.toLowerCase();
      }
      if(s.substring(0, 1) == '<'){
        var ind = s.indexOf(' ');
        if(ind > 0){
          return s.substring(0, ind).toLowerCase()+s.substring(ind);
        }
        return s.toLowerCase();
      }
      return s;
    }
    var s = oMain.m_doc.body.innerHTML.replace(/<\/?\w[^>]*>/g, change);
    if(s == '<br>') {
    	s = '';
    }
    return UUHEdts.userSavingContent(this.processHTML(s));
  }
  this.execCommand = function(cmd, args)
  {
    this.setFocus();
    oMain.m_doc.execCommand(cmd, false, args);
  }
  this.getSelectedElement = function() {
    if(UUHEdt_MSIE){
      var r = (oMain.m_range || oMain.m_doc.selection.createRange());
      if(r && r.item ) return r.item(0);
    }
    else{
      var s = oMain.m_win.getSelection();
      return s.anchorNode.childNodes[ s.anchorOffset ];
    }
    return null;
  }
  this.getRng = function() {
    if(UUHEdt_MSIE) return (oMain.m_range || oMain.m_doc.selection.createRange())
    return oMain.m_win.getSelection().getRangeAt(0);
  }
  this.getSelText = function() {
    var r = this.getRng();
    return (UUHEdt_MSIE ? r.text : r.toString());
  }
  this.getSelLink = function() {
    var h = '';
    var r = this.getRng();
    if (!r) return null;
    if (r.cloneContents){
      var s = oMain.m_win.getSelection();
      //for a
      var an = s.anchorNode;
      var fo = s.focusNode;
      if(an && fo && an == fo && fo.tagName && fo.tagName == 'A') {
        oMain.m_win.getSelection().removeAllRanges();
        var rr = oMain.m_doc.createRange();
        rr.selectNode(an);
        s.removeAllRanges();
        s.addRange(rr);
        return an;
      }
      while(an && an.parentNode) {
        an = an.parentNode;
        if(an.tagName == 'A') {
          oMain.m_win.getSelection().removeAllRanges();
          var rr = oMain.m_doc.createRange();
          rr.selectNode(an);
          s.removeAllRanges();
          s.addRange(rr);
          return an;
        }
      }
      return null;
    }
    return null;
  }
  this.getSelHtml = function() {
    var h = '';
    var r = this.getRng();
    if (!r) return null;
    if (r.cloneContents){
      //for table
      var s = oMain.m_win.getSelection();
      var an = s.anchorNode;
      if(an && an.nodeType == 1 && (an.tagName.toLowerCase() == 'td' || an.tagName.toLowerCase() == 'tr' || an.tagName.toLowerCase() == 'table')){
        while(an.tagName.toLowerCase() != 'table'){
          an = an.parentNode;
        }
        if( an.rows.length > 0 ){
          var div = oMain.m_doc.createElement ('div');
          div.appendChild ( an.cloneNode(true) );
          h = div.innerHTML;

          oMain.m_win.getSelection().removeAllRanges();
          var rr = oMain.m_doc.createRange();
          rr.selectNode(an);
          s.removeAllRanges();
          s.addRange(rr);
        }
      }
      if(h == ''){
        var div = oMain.m_doc.createElement ('div');
        div.appendChild (r.cloneContents());
        h = div.innerHTML;
      }
    }
    else if (typeof(r.item) != 'undefined' || typeof(r.htmlText) != 'undefined'){
      h = r.item ? r.item(0).outerHTML : r.htmlText;
    }
    else h = r.toString();
    return UUHEdts.userSavingContent(this.processHTML(h));
  }
  this.nodeIndex = function(node) {
	var idx = 0, lastNodeType, lastNode, nodeType;
	if (node) {
		for (lastNodeType = node.nodeType, node = node.previousSibling, lastNode = node; node; node = node.previousSibling) {
			nodeType = node.nodeType;

			idx++;
			lastNodeType = nodeType;
		}
	}
	return idx;
  }
  this.select = function(node) {
    var r = this.getRng();
	var idx = this.nodeIndex(node);
	r.setStart(node.parentNode, idx);
	r.setEnd(node.parentNode, idx + 1);

	return node;
  }
  this.getNode = function() {
    var r = this.getRng();
    if(!r) return null;
    if(r.item) return r.item(0);
    if(r.parentElement) return r.parentElement();
    return null;
  }
  this.processURL = function(h)
  {
    var u = oMain.m_doc.URL.replace(/\\/g, '/');
    var p = u.lastIndexOf('/');
    u = u.substring(0, p+1);
    if(u.substring(0, 7) == 'file://') u = u.substring(7);

    p = h.indexOf(u);
    if(p >= 0){
      h = h.substring(p + u.length);
    }
    return h;
  }
  //good done by tiny_mcs
  this.processHTML = function(h)
  {
    // Add20100703, Process all tags with src, href or style for "(){}#\&",should not has ">" in.
    h = h.replace(/<([\w:]+) [^>]*(src|href|style|shape|coords)[^>]*>/gi, function(a, n) {
      function handle2(m, b, c) {
        c = c.replace(/%28/g, '(');
        c = c.replace(/%29/g, ')');
        c = c.replace(/%7b/g, '{');
        c = c.replace(/%7d/g, '}');
        c = c.replace(/%21/g, '#');
        c = c.replace(/%5c/g, '\\');
        c = c.replace(/&amp;/g, '&');
        return ' ' + b + '="' + c + '"';
      };

      a = a.replace(/ (src|href|style|coords|shape)=[\"]([^\"]+)[\"]/gi, handle2); // W3C
      a = a.replace(/ (src|href|style|coords|shape)=[\']([^\']+)[\']/gi, handle2); // W3C
      return a;
    });

    if(UUHEdt_MSIE){
      h = h.replace(/\r|\n|\r\n/g, "");
      h = h.replace(/&apos;/g, '&#39;');
      h = h.replace(/\s+(disabled|checked|readonly|selected)\s*=\s*[\"\']?(false|0)[\"\']?/gi, '');

      var u = oMain.m_doc.URL.replace(/\\/g, '/');
      var p = u.lastIndexOf('/');
      u = u.substring(0, p+1);
      if(u.substring(0, 7) == 'file://') u = u.substring(7);

      // Process all tags with src, href or style
      h = h.replace(/<([\w:]+) [^>]*(src|href|style|shape|coords)[^>]*>/gi, function(a, n) {
        function handle(m, b, c) {
          var c2 = c;
          p = c.indexOf(u);
          if(p >= 0){
            c2 = c.substring(p + u.length);
          }
          return ' ' + b + '="' + c2 + '"';
        };

        a = a.replace(/ (src|href|style|coords|shape)=[\"]([^\"]+)[\"]/gi, handle); // W3C
        a = a.replace(/ (src|href|style|coords|shape)=[\']([^\']+)[\']/gi, handle); // W3C
        return a.replace(/ (src|href|style|coords|shape)=([^\s\"\'>]+)/gi, handle); // IE
      });
    }
    else if(navigator.userAgent.indexOf('Mozilla') >= 0) {
      function hex(s) {
        s = parseInt(s).toString(16);
        return s.length > 1 ? s : '0' + s;
      };
      h = h.replace(/rgb\s*?\(\s*?(\d+)\s*?,\s*?(\d+)\s*?,\s*?(\d+)\s*?\)/ig,
             function($0, $1, $2, $3) {
               return '#' + hex($1) + hex($2) + hex($3);
             }
      );
    }

    h = h.replace(/<a( )([^>]+)\/>|<a\/>/gi, '<a$1$2></a>'); // Force open
    return h;
  }

  this.pasteHTML = function(html)
  {
    var r = oMain.m_range;
    this.setFocus();
    if(UUHEdt_MSIE) {
      var rng = (r || oMain.m_doc.selection.createRange());
      if (rng.item) rng.item(0).outerHTML = html;
      else rng.pasteHTML(html);
    }
    else {
      oMain.m_doc.execCommand('InsertHtml', false, html);
    }
  }
  this.setFocus = function()
  {
    if(!oMain.m_win) return;
    oMain.m_win.focus();
    if(oMain.m_focus) return;
    this.onFocus();
  }
  this.print = function()
  {
    this.setFocus();
    oMain.m_win.print();
  }

  this.wlst = [];
  this.openWin = function(btnobj, title, html, ww, h, status, resize)
  {
    var ind = this.wlst.length;
    var obj = new Object();
    this.wlst[ind] = obj;
    var p = document.getElementById('UUHEdt_Cont' + ind);
    if(!p){
      p = document.createElement('div');
      p.id = 'UUHEdt_Cont' + ind;
      var d = document.getElementById(id+'_ifrm');
      if(d){
        d.parentNode.appendChild(p);
      }
      else{
        document.body.appendChild(p);
      }
    }
    obj.p = p;

    p.innerHTML = html;
    var tb = 'tab:0;';
    if(p.childNodes && p.childNodes.length == 1){
      var o = p.firstChild;
      obj.o = o;
      o.id = 'UUHEdt_ContW'+ind;
      if(o.childNodes.length > 1){
        tb = 'tab:1;';
      }
    }
    if(typeof(status) == 'string') tb += 'status:1;';
    else tb += 'status:0;';
    if(resize) tb += 'resize:1;';
    else tb += 'resize:0;';
    var w = null;
    if(typeof(FTab) == 'function'){
      var w = FTab('UUHEdt_ContW'+ind,0,0,ww,h,'modal:1;cookie:0;center:1;minmax:0;fixed:0;scroll:0;'+tb);
    }
    else if(typeof(SFTab) == 'function'){
      var w = SFTab('UUHEdt_ContW'+ind,0,0,ww,h,'modal:1;cookie:0;center:1;minmax:0;fixed:0;scroll:0;'+tb);
    }
    else{
      alert('Need FTab(Floating Tabs) or SFTab(Simple Floating Tabs)!');
      return false;
    }
    obj.w = w;
    w.show();
    if(status) w.setStatus(status);
  }

  this.getWinPage = getWinPage;
  function getWinPage()
  {
    if(this.wlst.length <= 0) return -1;
    return this.wlst[this.wlst.length-1].w.getSelectedIndex();
  }

  this.closeWin = closeWin;
  function closeWin()
  {
    if(this.wlst.length <= 0){
      this.setFocus();
      return;
    }
    var obj = this.wlst.pop();
    obj.w.hide();
    //clear prev
    var p = document.getElementById('UUHEdt_Cont' + (this.wlst.length+1));
    if(p){
      p.innerHTML = '';
    }
    this.setFocus();
  }

  this.pickColor = function(inputid, callback) {
    UUHEdtColor.pickColor(this, inputid, callback);
  }
  return this;
}
