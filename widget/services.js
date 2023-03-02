(function (angular, buildfire, location) {
    'use strict';
    //created mediaCenterWidget module
    angular
        .module('mediaCenterWidgetServices', ['mediaCenterEnums'])
        .provider('Buildfire', [function () {
            this.$get = function () {
                return buildfire;
            };
        }])
        .provider('Messaging', [function () {
            this.$get = function () {
                return buildfire.messaging;
            };
        }])
        .factory('Location', [function () {
            var _location = location;
            return {
                go: function (path, pushToHistory) {
                    if (pushToHistory) {
                        setTimeout(function () {
                            buildfire.history.push(path);
                        }, 1000);
                    }
                    _location.href = path;
                },
                goToHome: function () {
                    _location.href = _location.href.substr(0, _location.href.indexOf('#'));
                }
            };
        }])
        .factory('Orders', [function () {
            var ordersMap = {
                Manually: "Manually",
                Default: "Manually",
                Newest: "Newest",
                Oldest: "Oldest",
                Most: " Oldest",
                Least: " Oldest",
                MediaDateAsc: "Media Date Asc",
                MediaDateDesc: "Media Date Desc"
            };
            var orders = [
                { id: 1, name: "Manually", value: "Manually", key: "rank", order: 1 },
                { id: 1, name: "Newest", value: "Newest", key: "dateCreated", order: -1 },
                { id: 1, name: "Oldest", value: "Oldest", key: "dateCreated", order: 1 },
                { id: 1, name: "Media Title A-Z", value: "Media Title A-Z", key: "title", order: 1 },
                { id: 1, name: "Media Title Z-A", value: "Media Title Z-A", key: "title", order: -1 },
                { id: 1, name: "Media Date Asc", value: "Media Date Asc", key: "mediaDateIndex", order: 1 },
                { id: 1, name: "Media Date Desc", value: "Media Date Desc", key: "mediaDateIndex", order: -1 }
            ];
            return {
                ordersMap: ordersMap,
                options: orders,
                getOrder: function (name) {
                    return orders.filter(function (order) {
                        return order.name === name;
                    })[0];
                }
            };
        }])
        .factory('CategoryOrders', [function () {
            var ordersMap = {
                Manually: "Manually",
                Default: "Manually",
                Newest: "Newest",
                Oldest: "Oldest",
                Most: " Oldest",
                Least: " Oldest"
            };
            var orders = [
                {id: 1, name: "Manually", value: "Manually", key: "rank", order: 1},
                {id: 1, name: "Category Title A-Z", value: "Category Title A-Z", key: "title", order: 1},
                {id: 1, name: "Category Title Z-A", value: "Category Title Z-A", key: "title", order: -1},
                {id: 1, name: "Newest", value: "Newest", key: "createdOn", order: -1},
                {id: 1, name: "Oldest", value: "Oldest", key: "createdOn", order: 1},
            ];

            return {
                ordersMap: ordersMap,
                options: orders,
                getOrder: function (name) {
                    return orders.filter(function (order) {
                        return order.name === name;
                    })[0];
                }
            };
        }])
        .factory("OFSTORAGE", ['Buildfire', function (Buildfire) {
            function OFSTORAGE(data = {}) {
                this.instanceId = Buildfire.getContext().instanceId;
                this.path = data.path;
                this.fileName = `cache_${this.instanceId}_${data.fileName}.json`;
            }

            OFSTORAGE.prototype.get = function (callback) {
                    buildfire.services.fileSystem.fileManager.readFileAsText({
                        path: this.path,
                        fileName: this.fileName,
                    }, (error, result) => {
                        if (error && error.code !== 1) {
                            return callback(error);
                        } 
                        let parsedResult;
                        try {
                            if (result) {
                            parsedResult = JSON.parse(result);
                            result = result ? parsedResult : [];
                            callback(null, result);
                            }
                            else {
                                return callback(null, []);
                            }
                        }
                        catch (e) {
                            callback("Error parsing");
                        }
                    });
            };

            OFSTORAGE.prototype.getById = function (id, callback) {
                this.get((error, result) => {
                    if (error) return callback(error);
                    callback(null, result.filter(item => item.id === id)[0]);
                });
            };

            OFSTORAGE.prototype.insert = function (item, callback) {
                try {                  
                    buildfire.services.fileSystem.fileManager.writeFileAsText(
                        {
                            path: this.path,
                            fileName: this.fileName,
                            content: JSON.stringify(item),
                        },
                        (err, isWritten) => {
                            if (err) {
                                return callback(err);
                            } 
    
                            callback(null, isWritten);
                        }
                    );
                } catch (err) {
                }
            }

            // OFSTORAGE.prototype.update = function (item) {
            //     Buildfire.localStorage.setItem(this.tagName, item);
            // }

            // OFSTORAGE.prototype.getById = function (id) {
            //     let res = Buildfire.localStorage.getItem(this.tagName);
            //     if (res) {
            //         res = JSON.parse(res);
            //         return res.filter(function (item) {
            //             return item.mediaId == id;
            //         })[0];
            //     }
            //     return false;
            // };

            return OFSTORAGE;
        }])

        .factory("DB", ['Buildfire', '$q', 'MESSAGES', 'CODES', function (Buildfire, $q, MESSAGES, CODES) {
            function DB(tagName) {
                this._tagName = tagName;
            }

            DB.prototype.get = function () {
                var that = this;
                var deferred = $q.defer();
                Buildfire.datastore.get(that._tagName, function (err, result) {
                    if (err && err.code == CODES.NOT_FOUND) {
                        return deferred.resolve();
                    }
                    else if (err) {
                        return deferred.reject(err);
                    }
                    else {
                        return deferred.resolve(result);
                    }
                });
                return deferred.promise;
            };
            DB.prototype.getById = function (id) {
                var that = this;
                var deferred = $q.defer();
                Buildfire.datastore.getById(id, that._tagName, function (err, result) {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result && result.data) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };
            DB.prototype.insert = function (items) {
                var that = this;
                var deferred = $q.defer();
                if (typeof items == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.DATA_NOT_DEFINED));
                }
                if (Array.isArray(items)) {
                    Buildfire.datastore.bulkInsert(items, that._tagName, function (err, result) {
                        if (err) {
                            return deferred.reject(err);
                        }
                        else if (result) {
                            return deferred.resolve(result);
                        } else {
                            return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                        }
                    });
                } else {
                    Buildfire.datastore.insert(items, that._tagName, false, function (err, result) {
                        if (err) {
                            return deferred.reject(err);
                        }
                        else if (result) {
                            return deferred.resolve(result);
                        } else {
                            return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                        }
                    });
                }
                return deferred.promise;
            };
            DB.prototype.find = function (options) {
                var that = this;
                var deferred = $q.defer();
                if (typeof options == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.OPTION_REQUIRES));
                }
                Buildfire.datastore.search(options, that._tagName, function (err, result) {
                    if (err) {
           
                        return deferred.reject(err);
                    }
                    else if (result) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };
            DB.prototype.update = function (id, item) {
                var that = this;
                var deferred = $q.defer();
                if (typeof id == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.ID_NOT_DEFINED));
                }
                if (typeof item == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.DATA_NOT_DEFINED));
                }
                Buildfire.datastore.update(id, item, that._tagName, function (err, result) {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };
            DB.prototype.save = function (item) {
                var that = this;
                var deferred = $q.defer();
                if (typeof item == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.DATA_NOT_DEFINED));
                }
                Buildfire.datastore.save(item, that._tagName, function (err, result) {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };
            DB.prototype.delete = function (id) {
                var that = this;
                var deferred = $q.defer();
                if (typeof id == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.ID_NOT_DEFINED));
                }
                Buildfire.datastore.delete(id, that._tagName, function (err, result) {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };
            return DB;
        }])

        .factory("AppDB", ['$rootScope', 'Buildfire', '$q', 'MESSAGES', 'CODES', function ($rootScope, Buildfire, $q, MESSAGES, CODES) {
            function AppDB() { };

            const getTagName = () => {
                return 'MediaContent' + ($rootScope.user && $rootScope.user._id ? $rootScope.user._id : Buildfire.context.deviceId ? Buildfire.context.deviceId : '');
            };

            AppDB.prototype.get = () => {
                const tagName = getTagName();
                var deferred = $q.defer();
                Buildfire.appData.get(tagName, (err, result) => {
                    if (err && err.code == CODES.NOT_FOUND) {
                        return deferred.resolve();
                    }
                    else if (err) {
                        return deferred.reject(err);
                    }
                    else {
                        return deferred.resolve(result);
                    }
                });
                return deferred.promise;
            };

            AppDB.prototype.getById = (id) => {
                const tagName = getTagName();
                var deferred = $q.defer();
                Buildfire.appData.getById(id, tagName, (err, result) => {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result && result.data) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };

            AppDB.prototype.insertAndUpdate = (item) => {
                const tagName = getTagName();
                var deferred = $q.defer();
                if (typeof item == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.DATA_NOT_DEFINED));
                }

                const _set = { $set: { [`playlist.${item.id}`]: item.data } };
                Buildfire.appData.update($rootScope.globalPlaylistItems.id, _set, tagName, (err, result) => {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };

            AppDB.prototype.insertAndUpdateAll = (items) => {
                const tagName = getTagName();
                var deferred = $q.defer();
                if (typeof items == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.DATA_NOT_DEFINED));
                }
                const _set = { $set: {} };

                for (let item of items) {
                    _set.$set[`playlist.${item.id}`] = item.data;
                }

                Buildfire.appData.update($rootScope.globalPlaylistItems.id, _set, tagName, (err, result) => {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };

            AppDB.prototype.save = (item) => {
                const tagName = getTagName();
                var deferred = $q.defer();
                if (typeof item == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.DATA_NOT_DEFINED));
                };

                Buildfire.appData.save(item, tagName, (err, result) => {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };

            AppDB.prototype.delete = (id) => {
                const tagName = getTagName();
                var deferred = $q.defer();
                if (typeof id == 'undefined') {
                    return deferred.reject(new Error(MESSAGES.ERROR.ID_NOT_DEFINED));
                }

                const itemId = `playlist.${id}`;

                let unset = {
                    $unset: {
                        [itemId]: "",
                    },
                };

                Buildfire.appData.update($rootScope.globalPlaylistItems.id, unset, tagName, (err, result) => {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };

            AppDB.prototype.deleteAll = (itemsIds) => {
                const tagName = getTagName();
                var deferred = $q.defer();

                let unset = {
                    $unset: {},
                };

                itemsIds.forEach(itemId => {
                    unset['$unset'][`playlist.${itemId}`] = "";
                });

                Buildfire.appData.update($rootScope.globalPlaylistItems.id, unset, tagName, (err, result) => {
                    if (err) {
                        return deferred.reject(err);
                    }
                    else if (result) {
                        return deferred.resolve(result);
                    } else {
                        return deferred.reject(new Error(MESSAGES.ERROR.NOT_FOUND));
                    }
                });
                return deferred.promise;
            };

            // Global Playlist Limit get and set
            AppDB.prototype.getGlobalPlaylistLimit = () => {
                const tagName = "GlobalPlayListSettings";
                var deferred = $q.defer();
                Buildfire.appData.get(tagName, (err, result) => {
                    if (err && err.code == CODES.NOT_FOUND) {
                        return deferred.resolve();
                    }
                    else if (err) {
                        return deferred.reject(err);
                    }
                    else {
                        return deferred.resolve(result);
                    }
                });
                return deferred.promise;
            };

            return AppDB;
        }])
        .factory("PerfomanceIndexingService", ['Buildfire', function (Buildfire) {
            return {
              buildMediaCountDataIndex: function (data) {
                  var index = {
                      'string1': data.mediaId + "-" + (data.isActive ? "true":"false"),
                      'text':data.mediaId + "-" + data.userId + '-' + data.mediaType + "-" + (data.isActive ? "true":"false"),
                      'array1': [{
                          'string1': data.mediaId + "-" + data.userId + '-' + data.mediaType + "-" + (data.isActive ? "true":"false"),
                      }]
                  }
                  return index;
              },
  
              getMediaCountDataWithIndex: function (item) {
                  item.data._buildfire = {
                      index: this.buildMediaCountDataIndex(item.data)
                  }
                  return item;
              },
              processMediaCountsData: function (record, callback) {
                  if(record.data.userId){
                      record = this.getMediaCountDataWithIndex(record);
                      Buildfire.publicData.update(record.id, record.data, 'MediaCount', function (err, result) {
                          if (err) return console.error(err);
                          if (result && result.id) {
                              callback();
                          }
                      });
                  } else {
                      callback();
                  }
                 
              },
  
              iterateMediaCountData: function (records, index) {
                  if (index !== records.length) {
                      this.processMediaCountsData(records[index], () => this.iterateMediaCountData(records, index + 1));
                  } else {
                    // updating data is done for this user ---
                    Buildfire.userData.save(
                        { updated: true },
                        "userIndexingUpdateDone",
                        (err, result) => {
                          if (err) return console.error("Error while saving your data", err);
                      
                          Buildfire.dialog.alert(
                            {
                              title: "Database Optimization Done",
                              message: "Database has been successfully updated. Thank you for your patience!",
                            },
                            (err, result) => {
                              if (err) return console.error(err);
                          
                              console.log(result);
                            }
                          );
                        }
                      );
                  }
              },
              startMediaCountDataIndexingUpdate: function (userId) {
                  let searchOptions = {
                      limit: 50,
                      skip: 0,
                      filter:{
                          "_buildfire.index.array1.string1": null,
                          "$json.userId": userId,
                          "$json.isActive": true,
                      }
                  }, records = [];
                  
                  const getMediaCountData = () => {
                      Buildfire.publicData.search(searchOptions, "MediaCount", (err, result) => {
                          if (err) console.error(err);
                          if (result.length < searchOptions.limit) {
                              records = records.concat(result);
                              console.log(records)
                              this.iterateMediaCountData(records, 0);
                          } else {
                              searchOptions.skip = searchOptions.skip + searchOptions.limit;
                              records = records.concat(result);
                              return getMediaCountData();
                          }
                      })
                  }
  
                  getMediaCountData();
              },
              showIndexingDialog: function (userId) {
                Buildfire.dialog.alert(
                    {
                      title: "Data Optimization",
                      message: "We are improving your data, please do not close the app or leave the feature until you see success dialog. This may take a while...",
                    },
                    (err, result) => {
                      if (err) return console.error(err);
                  
                      console.log(result);
                    }
                  );
                  this.startMediaCountDataIndexingUpdate(userId);
              },
              validateIndexingUpdate: function(){
                Buildfire.auth.getCurrentUser((err, user) => {
                    if(err || !user){
                        Buildfire.getContext((err, context) => {
                            if(context && context.device.platform !== 'web'){
                                this.showIndexingDialog(context.deviceId);
                            }
                        })
                    }else if(user){
                        this.showIndexingDialog(user._id);
                    }
                });
              }
            } 
          
          }]);
})(window.angular, window.buildfire, window.location);