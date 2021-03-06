    function isFunction (f) {
        return f && f.constructor === Function
    }
    class MyPromise {
        constructor (fn) {
            this.status = 'pending';
            this.val = null;
            this.handler = [];
            this.errorHandler = [];
            const resolve = (data) => {
                if (this.status !== 'pending') return;
                this.status = 'fulfilled';
                this.val = data;
                setTimeout(() => {
                    this.handler.forEach((f) => {
                        f.call(this)
                    })
                }, 0)
            }
            const reject = (data) => {
                if (this.status !== 'pending') return;
                this.status = 'rejected';
                this.val = data;
                setTimeout(() => {
                    this.errorHandler.forEach((f) => {
                        f.call(this)
                    })
                }, 0)
            }
            fn.call(this, resolve, reject)
        }

        finally (cb) {
            this.then((data) => {
                let result = cb.call(this)
                let p = MyPromise.resolve(result).then(() => {
                    return data;
                })
                return p;
            }, (err) => {
                let result = cb.call(this)
                let p = MyPromise.resolve(result).then(() => {
                    throw new Error(err)
                })
                return p;
            })
        }

        then(onResolve, onReject) {
            return new MyPromise((resolve, reject) => {
                if (!isFunction(onResolve)) {
                    onResolve = () => this.val
                }

                if (!isFunction(onReject)) {
                    onReject = () => this.val;
                }

                const handle = (cb) => {
                    let res;
                    try {
                        res = cb.call(this, this.val)
                        if (res instanceof MyPromise) {
                            res.then((v) => {
                                resolve(v)
                            }, (err) => {
                                reject(err)
                            })
                        } else {
                            resolve(res)
                        }
                    } catch (err) {
                        reject(err)
                    }
                }

                if (this.status === 'fulfilled') {
                    setTimeout(() => {
                        handle(onResolve)
                    }, 0)

                }

                if (this.status === 'rejected') {
                    setTimeout(() => {
                        handle(onReject)
                    }, 0)
                }

                if (this.status === 'pending') {
                    let fn1 = () => {
                        handle(onResolve)
                    }
                    let fn2 = () => {
                        handle(onReject)
                    }
                    this.handler.push(fn1);
                    this.errorHandler.push(fn2)
                }

            })
        }

        catch (onReject) {
            this.then(null, onReject)
        }

        // ????????????promise ?????????????????????
        // ????????????thenable??????????????????promise??????
        // ????????????????????????promise??????
        static resolve (data) {
            if (data instanceof MyPromise) {
                return data;
            }
            if (typeof data === 'object' && isFunction(data.then)) {
                return new MyPromise((resolve, reject) => {
                    data.then.call(this, resolve, reject)
                })
            }
            return new MyPromise((resolve, reject) => {
                resolve(data)
            })
        }

        static reject (err) {
            return new MyPromise((resolve, reject) => {
                reject(err);
            })
        }

        // ???????????????????????????????????????p1 2 3???????????????resolved ??????p?????????????????????resolved
        // ?????????p1 p2 p3?????????reject p???????????????rejected
        static race (iterator) {
            return new MyPromise((resolve, reject) => {
                let arr = Array.from(iterator);
                arr.forEach((p, i) => {
                    MyPromise.resolve(p)
                        .then((data) => {
                            resolve(data)
                        }, (err) => {
                            reject(err)
                        })
                })
            })

        }

        // ???????????????????????????????????????p1 2 3???????????????resolved ??????p?????????????????????resolved
        // ?????????p1 p2 p3?????????reject p???????????????rejected
        static all (iterator) {
            return new MyPromise((resolve, reject) => {
                let arr = Array.from(iterator);
                let result = [];
                arr.forEach((item, i) => {
                    MyPromise.resolve(item)
                    .then((data) => {
                        result[i] = data;
                        if (result.length === arr.length) {
                            resolve(result);
                        }
                    }, (err) => {
                        reject(err)
                    })
                })

            })
        }
    }


    // ?????? https://zhuanlan.zhihu.com/p/138354431
    // https://zhuanlan.zhihu.com/p/102017798
