function MyPromise(excutor) {
    //初始化primise的状态
    let self = this;
    self.data = undefined;
    self.status = 'pending'
    //成功是可能执行的多个回调
    self.onResolveCallBack = []
    //失败是可能执行的多个回调
    self.onRejectCallBack = []

    try {
        excutor(resolve, reject)
    } catch(err) {
        reject(err)
    }

    function resolve(value) {
        if (self.status === 'pending') {
            self.stauts = 'resolved'
            self.data = value
            for (let i = 0; i < self.onResolveCallBack.length; i++) {
                self.onResolveCallBack[i](value)
            }
        }
    }
    function reject(value) {
        if (self.status === 'pending') {
            self.stauts = 'rejected'
            self.data = value
            for (let i = 0; i < self.onResolveCallBack.length; i++) {
                self.onRejectCallBack[i](value)
            }
        }
    }
}

MyPromise.prototype.then = function (onResolved, onRejected) {
    let self = this
    let promise2
    //1.判断传进来的是否是一个回调
    onResolved = typeof onResolved === 'function' ? onResolved : function(val){}
    onRejected = typeof onRejected === 'function' ? onRejected : function (val){ }

    //2.如果当前promise状态为resolved,返回一个新的promise2对象
    if (self.status === 'resolved') {
        return promise2 = new MyPromise(function (resolved, rejected) {
            //2.1若onResolved直接返回一个promise
            try {
                //2.2若回调的返回值为promise对象则直接返回这个对象
                if (onResolved() instanceof MyPromise) {
                    onResolved(self.data).then(resolved, rejected)
                } else {
                    resolved( onResolved(self.data))
                }

            } catch (err) {
                onRejected(err)
            }
            
            
        })
    }

    //3.当前为rejected状态
    if (self.status === 'rejected') {
        return promise2 = new MyPromise(function (resolved, rejected) {
            try {
                if (onReject() instanceof MyPromise) {
                    onReject(self.data).then(resolved, rejected)
                } 
            } catch (err) {
                onRejected(err)
            }
        })
    }

    //4.当前状态为pending状态
    if (self.status === 'pending') {
        return promise2 = new MyPromise(function (resolved, rejected) {
            self.onResolveCallBack.push(function (value) {
                try {
                    if (onResolved() instanceof MyPromise) {
                        onResolved(self.data).then(resolved, rejected)
                    } 
                } catch (err) {
                    onRejected(err)
                }
            })

            self.onResolveCallBack.push(function (value) {
                try {
                    if (onRejected() instanceof MyPromise) {
                        onRejected(self.data).then(resolved, rejected)
                    } 
                } catch (err) {
                    onRejected(err)
                }
            })
        })

        
    } 
}

MyPromise.prototype.catch = function (onRejected) {
    console.log('this',this);
    return this.then(null, onRejected)
}


let res = new MyPromise(function (res, rej) {
    setTimeout(() => {
        console.log(1111);
        res(2222)
    }, 1000)
    
})

console.log('res',res);
