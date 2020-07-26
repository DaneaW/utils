import fecha from "fecha"
import qs from "qs"
import growingIO from "./dataAnalysis/growingIO"

// import {
//     Notification,
//     Message
// } from "element-ui"


   

const MsgTypes = {
    i: "info",
    w: "warning",
    e: "error",
    s: "success"
}

// 消息 msg('i', 'hi', 'xxxx', ...)
export function msg(type) {
    let _lealType = MsgTypes[type] || type
    let _msgs = _(arguments).toArray().slice(1).value()
    // return Message({
    //     type: lealType,
    //     message: msgs.join(" "),
    // })
}

// 通知 notify('i', 'title', 'xxxx', ...)
export function notify(type) {
    let _lealType = MsgTypes[type] || type
    let _msgs = _(arguments).toArray().slice(1).value()
    // return Notification({
    //     type: lealType,
    //     title: msgs[0],
    //     message: _.slice(msgs, 1).join(" "),
    //     offset: 40
    // })
}

var _ps = null
export function pageParam(extraParams) {
    if(!_ps){
        _ps = qs.parse(_.trimStart(location.search, "?"))
        if(window.PAGE_PROJ_ID) _ps.project_id = window.PAGE_PROJ_ID
        if(window.PAGE_TEAM_ID) _ps.team_id = window.PAGE_TEAM_ID
    }

    if(extraParams){
        return _.merge({}, _ps, extraParams)
    }

    return _ps
}

export function updatePageParma(options) {
    _ps = _.merge(pageParam(), options)
}

export function pageSearch(extraParams) {
    return pageParam(extraParams)
}

export function redirect(url, extraParams=false){
    if(_.isEmpty(url)) return
    if(extraParams){
        url = urlAppendPageParam(url, extraParams)
    }
    window.location.href = url
}

export function urlAppendPageParam(url, extraParams={}){
    extraParams = pageParam(extraParams)
    return urlAppendParam(url, extraParams)
}

export function urlAppendParam(url, extraParams={}){
    if(_.isFunction(url)){ // tpl
        url = url(extraParams)
    }

    let r = /\?([^#]+)/
    let query = _.get(url.match(r), "1")

    if(query){ // 有 query，合并 baseQueryMap
        let queryMap = qs.parse(query)
        queryMap = extendNew(queryMap, extraParams)
        url = _.replace(url, query, qs.stringify(queryMap))
    }else{ // 插入 baseQueryMap
        url = url + "?" + qs.stringify(extraParams)
    }

    return url
}

// 扩展出新对象
export function extendNew(...args){
    return _.assignIn({}, ...args)
}

var  toDoubleDigit= (n)=>{
    return n < 10 ? "0" + n : n
}

export function getPicUrlByMd5(md5){
    return "/v3/file/file/view?md5="+md5
}

export function getPicUrlByMd5_V1(md5){
    return "/platform/v1/papi/web_file/image_view/?&width=-1&webp=0&file_md5="+md5
}

export function formatDateTime(timestamp,format="%Y-%m-%d",TimeType='timestamp'){
    if (timestamp <= 0) {
        return ""
    }
    var d
    if(TimeType=='timestamp'){
      d = new Date(timestamp * 1000)
    }else if(TimeType == 'notimestamp'){
      d = new Date(timestamp)
    }


    var tars = format.match(/%\w/g)
    var result = format
    for(var i in tars){
        switch(tars[i]){
        case "%Y":
            result = result.replace(/%Y/g,d.getFullYear())
            break
        case "%m":
            result = result.replace(/%m/g,toDoubleDigit(d.getMonth() + 1))
            break
        case "%d":
            result = result.replace(/%d/g,toDoubleDigit(d.getDate()))
            break
        case "%H":
            result = result.replace(/%H/g,toDoubleDigit(d.getHours()))
            break
        case "%i":
            result = result.replace(/%i/g,toDoubleDigit(d.getMinutes()))
            break
        case "%s":
            result = result.replace(/%s/g,toDoubleDigit(d.getSeconds()))
            break
        }
    }
    return result
}


export function timestampToDateString(date, withTime=false, zero_text=false){
    if(zero_text && date == 0){
        return zero_text
    }
    if(!date) return ""
    date = new Date(date * 1000)
    if(withTime){
        return fecha.format(date, "YYYY-MM-DD HH:mm:ss")
    }
    return fecha.format(date, "YYYY-MM-DD")
}

export function seqTimeFormat(year, type, index) {
    //  第几周的处理：ISO 8601
    //  该年度的1月1日，如果是星期一，星期二，星期三，星期四，那么，1月1日所在的星期就是该年度的第一个星期。
    //  该年度的1月1日，如果是星期五，星期六，星期日，那么1月1日所在的星期就是上一年的最后一个星期。
    //  每个星期以星期一为开始，星期日为结束。
    let date, firstDay, startDate, endDate
    let weekDays = index * 7
    type = _.upperCase(type)
    switch (type) {
    case "WEEK":
        firstDay = (new Date(year, 0, 1)).getDay()
        if(firstDay > 0 && firstDay < 5){
            startDate = new Date(year, 0, 1 - firstDay + weekDays - 6)
            endDate = new Date(year, 0, 1 - firstDay + weekDays)
        }else{
            if(firstDay == 0) firstDay = 7
            startDate = new Date(year, 0, 8 - firstDay + weekDays - 6)
            endDate = new Date(year, 0, 8 - firstDay + weekDays)
        }
        return [fecha.format(startDate, "M/D"), fecha.format(endDate, "M/D")].join("-")
    case "DAY":
        date = new Date(year, 0, index)
        return fecha.format(date, "M/D")
    case "MONTH":
        return _.join([year, index + "月"], "/")
    case "QUARTER":
        return _.join([year, index + "季"], "/")
    case "YEAR":
        return _.toString(year)
    }
    return _.join([year, index + type], "/")
}

export function dateToString(date, format="YYYY-MM-DD"){
    if(!date) return null
    return fecha.format(new Date(date), format)
}

export function beginOfDate(date){
    date = date ? new Date(date) : new Date()
    date.setHours(0,0,0,0)
    return date
}

export function deltaToDate(delta=0){
// 获得 和今天的偏差天数对应的 date
    let date = beginOfDate()
    let days = date.getDate() + delta
    date.setDate(days)
    return date
}


export function dateToDelta(date){
// 获得 date 和 今天的天数偏差
    date = beginOfDate(date)
    let today = beginOfDate()
    let msPerDay = 1000 * 60 * 60 * 24
    return _.toSafeInteger((date - today)/msPerDay)
}

export function dateDiff(date1,date2){
    // 获得 某两天的天数偏差
    date1 = beginOfDate(date1)
    date2 = beginOfDate(date2)
    let msPerDay = 1000 * 60 * 60 * 24
    return _.toSafeInteger((date2 - date1)/msPerDay)
}

export function listToTree(nodes, {parentId, idName = "id", parentIdName = "parentId", fnNodeDecorate=_.noop}) {
    let nodeMap = {
        [parentId]: {children: []}
    }
    _.each(nodes, (node)=>{
        nodeMap[node[idName]] = node
        fnNodeDecorate(node)
    })
    _.each(nodes, (node)=>{
        let fnode = nodeMap[node[parentIdName]]
        if(fnode){
            fnNodeDecorate(fnode, "parent")
            if(!fnode.children) fnode.children = []
            fnode.children.push(node)
        }
    })
    return nodeMap[parentId].children
}

//统计打点,数据分析工具
class DataAnalysis {
    constructor(dataAnalysis) {
        this.dataAnalysis = dataAnalysis || {}
        this.data = {}
    }
    //初始化（init）
    init(data){
       return this.dataAnalysis.init(data) || false
    }
    //设置登录用户ID（setUserId）
    setUserId(data){
        return this.dataAnalysis.setUserId(data) || false
    }
    //清除登录用户ID（clearUserId）
    clearUserId(data){
        return this.dataAnalysis.clearUserId(data) || false
    }
    //设置登录用户级变量,传入健值对的对象
    setPeopleVal(customerVariables){
        return this.dataAnalysis.setPeopleVal(customerVariables) || false
    }
    //设置访问用户级变量,传入健值对的对象
    setVisitorVal(visitorVariables){
        return this.dataAnalysis.setVisitorVal(visitorVariables) || false
    }
    //设置页面级变量,传入健值对的对象
    setPageVal(pageLevelVariables){
        return this.dataAnalysis.setPageVal(pageLevelVariables) || false
    }
    //设设置转化变量
    setEval(conversionVariables){
        return this.dataAnalysis.setEval(conversionVariables) || false
    }
    //设置自定义事件和事件级变量（track）
    track(conversionVariables){
        return this.dataAnalysis.track(conversionVariables) || false
    }
    //手动发送页面浏览事件(sendPage)
    sendPage(){
        return this.dataAnalysis.sendPage() || false
    }
    //GDPR数据采集开关
    config(data){
        return this.dataAnalysis.config(data) || false
    }
    //获取访问用户ID（getVisitUserId）
    getVisitUserId(){
        return this.dataAnalysis.getVisitUserId() || false
    }
}

//返回数据分析工具对象
export function dataIO() {
        //此处使用growingIO
        let _dataIO = new DataAnalysis(growingIO())
        return _dataIO
}


// 应用临时缓存
class AppCache {
    constructor(namespace) {
        this.namespace = namespace
        this.data = {}
    }

    hasData(){
        return !_.isEmpty(this.data)
    }

    get(path, defaultVal=null){
        return _.get(this.data, path, defaultVal)
    }

    set(path, value){
        _.setWith(this.data, path, value, Object)
        return this
    }

    del(path){
        _.unset(this.data, path)
        return this
    }

    clear(){
        this.data = {}
        return this
    }
}


// localStorage 级别缓存
class LocalCache extends AppCache {
    constructor(namespace) {
        super(namespace)
    }

    checkLocalStore(){
        return window.localStorage
    }

    load(){
        if(!this.checkLocalStore()) return this
        let data = window.localStorage.getItem(this.namespace)
        try{
            this.data = JSON.parse(data) || {}
        }catch(err){

        }
        return this
    }

    save(markUpdateAt=true){
        if(!this.checkLocalStore()) return this
        if(markUpdateAt){
            this.set("updatedAt", new Date)
        }
        window.localStorage.setItem(this.namespace, JSON.stringify(this.data))
        return this
    }
}

var localCacheMap = {}
var appCacheMap = {}

function loadCache(cacheMap, namespace, cacheBuild) {
    let cache = cacheMap[namespace]
    if(cache) return cache
    cache = cacheBuild(namespace)
    cacheMap[namespace] = cache
    return cache
}

export function loadLocalCache(namespace) {
    return loadCache(localCacheMap, namespace, (ns)=>{
        let cache = new LocalCache(ns)
        cache.load()
        return cache
    })
}

export function loadAppCache(namespace) {
    return loadCache(appCacheMap, namespace, (ns)=>{
        return new AppCache(ns)
    })
}

// zj.appCache 全局应用缓存
export var appCache = loadAppCache("app")
export var appLocalCache = loadLocalCache("app")

export function chain(...fnList) {
    return function(args){
        return _.reduce(fnList, function(prev, fn){
            return prev.then(function() {
                let d = $.Deferred()
                try {
                    fn(args, function(isNext=true){
                        if(isNext === true){
                            d.resolve(args)
                        }else{
                            d.reject(isNext)
                        }
                    })
                } catch (e) {
                    d.reject(e)
                }
                return d.promise()
            })
        }, $.when())
    }
}


export var pageSetupCallbacks = $.Callbacks();
export function onPageSetup(fn) {
    if (pageSetupCallbacks.fired()) {
        fn()
    } else {
        pageSetupCallbacks.add(fn)
    }
}

export function getLevelPageMenu(str){
    let pageLevel = zj.pageParam().page_level || "group"
    return { // 页面导航菜单信息
        index: `${pageLevel}/${str}`, // nav menu index
        level: pageLevel
    }
}

export function numberConvertToUppercase(num){
    num = Number(num);
    var upperCaseNumber = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '亿'];
    var length = String(num).length;
    if (length == 1) {
      return upperCaseNumber[num];
    } else if (length == 2) {
      if (num == 10) {
        return upperCaseNumber[num];
      } else if (num > 10 && num < 20) {
        return '十' + upperCaseNumber[String(num).charAt(1)];
      } else {
        return upperCaseNumber[String(num).charAt(0)] + '十' + upperCaseNumber[String(num).charAt(1)].replace('零', '');
      }
    }
  }
export function getIssueOverviewLevelPageMenu(prod){
  let pageLevel = zj.pageParam().page_level || "group"
  return { // 页面导航菜单信息
    index: `${prod}/stat/${pageLevel}/issue/overview`, // nav menu index
    level: pageLevel
  }
}
export function getIssueLevelPageMenu(prod,page){
  let pageLevel = zj.pageParam().page_level || "group"
  return { // 页面导航菜单信息
    index: `${prod}/stat/${pageLevel}/issue/${page}`, // nav menu index
    level: pageLevel
  }
}


export function getDate(){//获取近30天时间
    //获取当前日期
    let myDate = new Date();
  
    let enddate = new Date(myDate).getTime()
    enddate = _.toInteger(enddate/1000)
    //获取三十天前日期
    let lw = new Date(myDate - 1000 * 60 * 60 * 24 * 30);//最后一个数字30可改，30天的意思
    let lastY = lw.getFullYear();
    let lastM = lw.getMonth()+1;
    let lastD = lw.getDate();
    let startdate=lastY+"-"+(lastM<10 ? "0" + lastM : lastM)+"-"+(lastD<10 ? "0"+ lastD : lastD) + " 00:00:00";//三十天之前日期
    startdate = new Date(startdate).getTime()
    startdate = _.toInteger(startdate/1000)
    return  {
        startTime: startdate,
        endTime:  enddate
    }
  }

