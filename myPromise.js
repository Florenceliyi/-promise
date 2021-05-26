const RESOLVED = 'RESOLVED'
const PENDING = 'PENDING'
const REJECTED = 'REJECTED'
class MyPromise{
    constructor(excuetor) {
        this.status = PENDING
        this.value = undefined
        this.reason = undefined
        this.onResolvedCallBack = []
        this.onRejectedCallBack = []
        //判断是否是传入了一个函数
        if (!this._isFunction(excuetor)) {
             throw new Error("is not a function")
        }
        //调用this._isResolved和this._isRejected的方法时的this一般指向windows，这里需要在调用的时候就修改为当前实例
        excuetor(this._isResolved.bind(this), this._isRejected.bind(this))

    }

    then(onResolved, onReject) {
        // 回调会返回一个新的promise对象
        return new MyPromise((nextRes, nextRej) => {
            if (this._isFunction(onResolved)) {
                if (this.status === RESOLVED) {
                    //添加监听时状态已改变，立刻执行监听状态改变的回调，用try，catch包裹监听可以捕获错误
                    try {
                        if (onResolved(this.value) instanceof Promise) {
                            //监听状态改变的then回调
                            onResolved(this.value).then(nextRes, nextRej)
                        } else {
                            //promise会将上一个成功的回调传给下一个promise成功的回调
                            nextRes(onResolved(this.value))
                        }
                    } catch (e) {
                        //直接把错误信息传给错误回调
                        nextRej(e)
                   }
                }
            } 
            //当前状态一旦发生改变就不可再改变，因此需要判断是否是pending状态转变过来的
            //不管第二个参数有没有传，都应该捕获then方法中的错误
            // if (this._isFunction(onReject)) {
            if (this.status === REJECTED) {
                    try {
                        if (onReject(this.reason) instanceof Promise) {
                            onReject(this.reason).then(nextRes, nextRej)
                        } else if(onReject(this.reason) !== undefined){
                            //将上一个成功的回调传给下一个promise成功的回调
                            nextRes(onResolved(this.reason))
                        } else {
                            nextRej(this.reason)
                        }
                    } catch (e) {
                        nextRej(e)
                   }
                }
            // } 

            if (this.status === PENDING) {
                if (this._isFunction(onResolved)) {
                    this.onResolvedCallBack.push(() => {
                        try {
                            if (onResolved(this.value) instanceof Promise) {
                                onResolved(this.value).then(nextRes, nextRej)
                            } else {
                                //将上一个成功的回调传给下一个promise成功的回调
                                nextRes(onResolved(this.value))
                            }
                        } catch (e) {
                            nextRej(e)
                       }
                   })
                } 
                
                // if (this._isFunction(onReject)) {
                    this.onRejectedCallBack.push(() => {
                        try {
                            if (onReject(this.reason) instanceof Promise) {
                                //上一个回调返回了一个promise对象，则下一个的回调状态由上一个的promise状态决定
                                onReject(this.reason).then(nextRes, nextRej)
                            } else if(onReject(this.reason) !== undefined){
                                //无论上一个回调的结果是成功还是失败都要返回给下一个成功的回调
                                nextRes(onResolved(this.reason))
                            } else {
                                nextRej(this.reason)
                            }
                        } catch (e) {
                            nextRej(e)
                       }
                    })
                // } 
            }

        })
    }

    catch(onRejected) {
       return this.then(undefined, onRejected)
    }

    _isResolved(data) {
        if (this.status === PENDING) {
            this.status = RESOLVED
            this.value = data
            //这里收集异步的状态回调，当状态改变时会逐一执行里面的回调
            this.onResolvedCallBack.forEach(fn => fn(this.value))
        }
    }

    _isRejected(reason) {
        if (this.status === PENDING) {
            this.status = REJECTED
            this.reason = reason
            this.onRejectedCallBack.forEach(fn => fn(this.reason))
        }
    }

    _isFunction(fn) {
        return typeof fn === 'function'
    }

    /*1.Promise.all是一个静态方法
    2.会按照传入的数组的顺序返回一个新的数组包含了所有成功状态的返回结果
    3.一旦某个promise失败整个数组就会返回失败的结果
    */
    static all(promiseList) {
        return new MyPromise((resolved, rejected)=>{
            const arr = []
            let count = 0
            promiseList.forEach(promise => {
                if (promise instanceof MyPromise){
                    promise.then((val)=>{
                        arr.push(val)
                        count++
                        if (count === arr.length) {
                            //只有所有的primise都返回成功的状态才最终返回成功的数组
                            resolved(arr)
                        }
                    }).catch((err)=>{
                        rejected(err)
                    })
                }
            })
        })
    }
    /*1.Promise.race是一个静态方法
    2.返回一个新的promise对象,只要其中一个先改变状态就返回该状态
    */
    static race(promiseList) {
        return new MyPromise((resolved, rejected) => {
            promiseList.forEach(promise => {
                if (promise instanceof MyPromise) {
                    promise.then((val) => {
                        resolved(val)
                    }).catch((err) => {
                        rejected(err)
                    })
                }
            })
        })

        
    }
}



