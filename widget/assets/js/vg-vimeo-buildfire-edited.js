// this code is the un-minfied version of "vg-vimeo.min.js" file that make a connection between Vigulaor & Vimeo APIs. its original from Github but the source is unknown! this file has some updates comparing to the original one(vg-vimeo.min.js).

!(function (e) {
    "use strict";
    e.module("rc-videogular.plugins.vimeo", []).directive("vgVimeo", [
        "$window",
        "$timeout",
        "VG_STATES",
        "VG_UTILS",
        "VG_VOLUME_KEY",
        function (t, n, i, o, a) {
            return {
                restrict: "A",
                require: "^videogular",
                link: function (r, l, u, c) {
                    var m,
                        s,
                        d,
                        f = 0,
                        p = 0,
                        g = !0,
                        v = 0,
                        E = e.isDefined(u.vgVimeoFullscreen) ? u.vgVimeoFullscreen : "true",
                        y = function () {
                            c.onUpdateTime({ target: c.mediaElement[0] });
                        },
                        h = function () {
                            g = !1;
                            var e = new CustomEvent("playing");
                            c.mediaElement[0].dispatchEvent(e), c.setState(i.PLAY);
                        },
                        b = function () {
                            g = !0;
                            var e = new CustomEvent("pause");
                            c.mediaElement[0].dispatchEvent(e), c.setState(i.PAUSE);
                        },
                        w = function () {
                            c.onComplete();
                        },
                        P = function (e) {
                            (f = e.seconds), (p = e.duration), y();
                        },
                        V = function (e) {
                            var t = new CustomEvent("waiting");
                            c.mediaElement[0].dispatchEvent(t);
                        };
                    function S() {
                        var e = new CustomEvent("loadedmetadata");
                        c.mediaElement[0].dispatchEvent(e);
                    }
                    function C(l) {
                        if (l) {
                            var u,
                                C,
                                A,
                                O = (u = l.match(/^.+vimeo.com\/(.*\/)?([^#\?]*)/)) ? u[2] || u[1] : null;
                            O &&
                                ((C = O),
                                (C = u[1] ? u[1].split("/")[0] + "?h=" + u[2]+"&" : u[2] + "?"),
                                m ? (A = m.element) : ((A = document.createElement("iframe")), e.element(c.mediaElement[0]).replaceWith(e.element(A))),
                                (A.src = "https://player.vimeo.com/video/" + C + "player_id=vimeoplayer&title=0&byline=0&portrait=0&controls=1"),
                                (A.style.width = "100%"),
                                (A.style.height = "100%"),
                                r.$eval(E) && (A.setAttribute("webkitallowfullscreen", ""), A.setAttribute("mozallowfullscreen", ""), A.setAttribute("allowfullscreen", "")),
                                e.element(A.parentNode.parentNode).find("vg-overlay-play").css("height", "calc(100% - 50px)"),
                                (m = new Vimeo.Player(A)).ready().then(function () {
                                    !(function () {
                                        if (
                                            (angular.element("#vg-controls").css("display", "none"),
                                            angular.element("#vg-overlay-play").css("display", "none"),
                                            Object.defineProperty(c.mediaElement[0], "currentTime", {
                                                get: function () {
                                                    return f;
                                                },
                                                set: function (e) {
                                                    (f = e), m.setCurrentTime(f);
                                                },
                                                enumerable: !0,
                                                configurable: !0,
                                            }),
                                            Object.defineProperty(c.mediaElement[0], "duration", {
                                                get: function () {
                                                    return p;
                                                },
                                                enumerable: !0,
                                                configurable: !0,
                                            }),
                                            Object.defineProperty(c.mediaElement[0], "paused", {
                                                get: function () {
                                                    return g;
                                                },
                                                enumerable: !0,
                                                configurable: !0,
                                            }),
                                            Object.defineProperty(c.mediaElement[0], "videoWidth", {
                                                get: function () {
                                                    return s;
                                                },
                                                enumerable: !0,
                                                configurable: !0,
                                            }),
                                            Object.defineProperty(c.mediaElement[0], "videoHeight", {
                                                get: function () {
                                                    return d;
                                                },
                                                enumerable: !0,
                                                configurable: !0,
                                            }),
                                            Object.defineProperty(c.mediaElement[0], "volume", {
                                                get: function () {
                                                    return v;
                                                },
                                                set: function (e) {
                                                    (v = e), m.setVolume(v);
                                                },
                                                enumerable: !0,
                                                configurable: !0,
                                            }),
                                            (c.mediaElement[0].play = function () {
                                                m.play();
                                            }),
                                            (c.mediaElement[0].pause = function () {
                                                m.pause();
                                            }),
                                            m.getVolume().then(function (e) {
                                                (v = e), c.onVolumeChange();
                                            }),
                                            m.getCurrentTime().then(function (e) {
                                                (f = e), S();
                                            }),
                                            m.getDuration().then(function (e) {
                                                (p = e), S();
                                            }),
                                            y(),
                                            o.supportsLocalStorage() && 0 < parseFloat(t.localStorage.getItem(a) || "1") && (c.mediaElement[0].muted = !1),
                                            c.currentState !== i.PLAY)
                                        ) {
                                            var e = new CustomEvent("canplay");
                                            c.mediaElement[0].dispatchEvent(e),
                                                !0 === c.autoPlay &&
                                                    n(function () {
                                                        c.play();
                                                    });
                                        } else m.play().then(function () {});
                                    })();
                                }),
                                m.on("play", h),
                                m.on("pause", b),
                                m.on("ended", w),
                                m.on("timeupdate", P),
                                m.on("progress", V));
                        } else m && m.destroy();
                    }
                    r.$watch(
                        function () {
                            return c.sources;
                        },
                        function (e, t) {
                            e && 0 < e.length && e[0].src ? C(e[0].src.toString()) : C(null);
                        }
                    );
                },
            };
        },
    ]);
})(angular);
