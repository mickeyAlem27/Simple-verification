import ge, { useState as p, useRef as Z, useEffect as me } from "react";
var Q = { exports: {} }, q = {};
var pe;
function Te() {
  if (pe) return q;
  pe = 1;
  var d = Symbol.for("react.transitional.element"), Y = Symbol.for("react.fragment");
  function k(m, i, l) {
    var E = null;
    if (l !== void 0 && (E = "" + l), i.key !== void 0 && (E = "" + i.key), "key" in i) {
      l = {};
      for (var b in i)
        b !== "key" && (l[b] = i[b]);
    } else l = i;
    return i = l.ref, {
      $$typeof: d,
      type: m,
      key: E,
      ref: i !== void 0 ? i : null,
      props: l
    };
  }
  return q.Fragment = Y, q.jsx = k, q.jsxs = k, q;
}
var L = {};
var he;
function _e() {
  return he || (he = 1, process.env.NODE_ENV !== "production" && (function() {
    function d(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === W ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case _:
          return "Fragment";
        case P:
          return "Profiler";
        case K:
          return "StrictMode";
        case X:
          return "Suspense";
        case ce:
          return "SuspenseList";
        case V:
          return "Activity";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case j:
            return "Portal";
          case U:
            return e.displayName || "Context";
          case y:
            return (e._context.displayName || "Context") + ".Consumer";
          case M:
            var t = e.render;
            return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case J:
            return t = e.displayName || null, t !== null ? t : d(e.type) || "Memo";
          case R:
            t = e._payload, e = e._init;
            try {
              return d(e(t));
            } catch {
            }
        }
      return null;
    }
    function Y(e) {
      return "" + e;
    }
    function k(e) {
      try {
        Y(e);
        var t = !1;
      } catch {
        t = !0;
      }
      if (t) {
        t = console;
        var n = t.error, s = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return n.call(
          t,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          s
        ), Y(e);
      }
    }
    function m(e) {
      if (e === _) return "<>";
      if (typeof e == "object" && e !== null && e.$$typeof === R)
        return "<...>";
      try {
        var t = d(e);
        return t ? "<" + t + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function i() {
      var e = S.A;
      return e === null ? null : e.getOwner();
    }
    function l() {
      return Error("react-stack-top-frame");
    }
    function E(e) {
      if (ee.call(e, "key")) {
        var t = Object.getOwnPropertyDescriptor(e, "key").get;
        if (t && t.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function b(e, t) {
      function n() {
        re || (re = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          t
        ));
      }
      n.isReactWarning = !0, Object.defineProperty(e, "key", {
        get: n,
        configurable: !0
      });
    }
    function ie() {
      var e = d(this.type);
      return v[e] || (v[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function le(e, t, n, s, C, G) {
      var r = n.ref;
      return e = {
        $$typeof: F,
        type: e,
        key: t,
        props: n,
        _owner: s
      }, (r !== void 0 ? r : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: ie
      }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(e, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(e, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: C
      }), Object.defineProperty(e, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: G
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function T(e, t, n, s, C, G) {
      var r = t.children;
      if (r !== void 0)
        if (s)
          if (te(r)) {
            for (s = 0; s < r.length; s++)
              h(r[s]);
            Object.freeze && Object.freeze(r);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else h(r);
      if (ee.call(t, "key")) {
        r = d(e);
        var o = Object.keys(t).filter(function(f) {
          return f !== "key";
        });
        s = 0 < o.length ? "{key: someKey, " + o.join(": ..., ") + ": ...}" : "{key: someKey}", w[r + s] || (o = 0 < o.length ? "{" + o.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          s,
          r,
          o,
          r
        ), w[r + s] = !0);
      }
      if (r = null, n !== void 0 && (k(n), r = "" + n), E(t) && (k(t.key), r = "" + t.key), "key" in t) {
        n = {};
        for (var c in t)
          c !== "key" && (n[c] = t[c]);
      } else n = t;
      return r && b(
        n,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), le(
        e,
        r,
        n,
        i(),
        C,
        G
      );
    }
    function h(e) {
      A(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e !== null && e.$$typeof === R && (e._payload.status === "fulfilled" ? A(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
    }
    function A(e) {
      return typeof e == "object" && e !== null && e.$$typeof === F;
    }
    var u = ge, F = Symbol.for("react.transitional.element"), j = Symbol.for("react.portal"), _ = Symbol.for("react.fragment"), K = Symbol.for("react.strict_mode"), P = Symbol.for("react.profiler"), y = Symbol.for("react.consumer"), U = Symbol.for("react.context"), M = Symbol.for("react.forward_ref"), X = Symbol.for("react.suspense"), ce = Symbol.for("react.suspense_list"), J = Symbol.for("react.memo"), R = Symbol.for("react.lazy"), V = Symbol.for("react.activity"), W = Symbol.for("react.client.reference"), S = u.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ee = Object.prototype.hasOwnProperty, te = Array.isArray, O = console.createTask ? console.createTask : function() {
      return null;
    };
    u = {
      react_stack_bottom_frame: function(e) {
        return e();
      }
    };
    var re, v = {}, $ = u.react_stack_bottom_frame.bind(
      u,
      l
    )(), I = O(m(l)), w = {};
    L.Fragment = _, L.jsx = function(e, t, n) {
      var s = 1e4 > S.recentlyCreatedOwnerStacks++;
      return T(
        e,
        t,
        n,
        !1,
        s ? Error("react-stack-top-frame") : $,
        s ? O(m(e)) : I
      );
    }, L.jsxs = function(e, t, n) {
      var s = 1e4 > S.recentlyCreatedOwnerStacks++;
      return T(
        e,
        t,
        n,
        !0,
        s ? Error("react-stack-top-frame") : $,
        s ? O(m(e)) : I
      );
    };
  })()), L;
}
var ye;
function Re() {
  return ye || (ye = 1, process.env.NODE_ENV === "production" ? Q.exports = Te() : Q.exports = _e()), Q.exports;
}
var a = Re();
function we({ onVerify: d }) {
  const m = { x: 500, y: 150 }, i = { x: 50, y: 340 }, l = { x: 50, y: 20 }, E = { x: m.x - 60, y: m.y + 40 }, b = 2, T = Math.abs(l.y - i.y) / (4e3 / 16.6), [h, A] = p({ ...i }), [u, F] = p(!1), [j, _] = p(null), [K, P] = p("🎯 Drag the target and throw the stick!"), [y, U] = p({
    x: l.x + 90,
    y: l.y + (i.y - l.y) * 0.55
  }), [M, X] = p(0), [ce, J] = p(!1), [R, V] = p(!1), [W, S] = p(!1), [ee, te] = p(0), [O, re] = p(!1), [v, $] = p([]), I = Z(crypto.randomUUID()), w = Z(!0), e = Z(!1), t = Z({ arrow: null, thief: null });
  me(() => {
    const r = setInterval(() => {
      O || te((o) => (o + 1) % 360);
    }, 50);
    return () => clearInterval(r);
  }, [O]);
  const n = (r, o = {}) => {
    $((c) => [...c, { type: r, time: Date.now(), ...o }]);
  }, s = async (r) => {
    try {
      console.log("Sending verification to server...", {
        success: r,
        evidenceCount: v ? v.length : 0,
        sessionId: I.current
      }), v && v.length > 0 && console.log("Evidence being sent:", JSON.stringify(v, null, 2));
      const o = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          success: !!r,
          evidence: v || [],
          sessionId: I.current
        })
      }), c = await o.text();
      let f;
      try {
        f = c ? JSON.parse(c) : {};
      } catch (g) {
        throw console.error("Failed to parse JSON response:", g, "Response:", c), new Error(`Invalid JSON response from server: ${c}`);
      }
      if (!o.ok)
        throw console.error("Server error response:", {
          status: o.status,
          statusText: o.statusText,
          data: f
        }), new Error(`HTTP error! status: ${o.status}, message: ${f.error || f.message || "Unknown error"}`);
      return console.log("Verification successful, response:", f), f;
    } catch (o) {
      throw console.error("Verification send error:", o), o;
    }
  };
  me(() => {
    if (u || W || R) return;
    let r;
    const o = () => {
      A((c) => {
        if (e.current) return c;
        const f = w.current ? l : i, g = f.y - c.y;
        if (Math.abs(g) < T) {
          const x = M + 1;
          return e.current = !0, n("tripEnd", { nextTrip: x }), setTimeout(() => {
            x >= b * 2 ? u || (n("failEnd"), P("🚨 Mission Failed! The thief escaped!"), s(!1).then((z) => {
              d && d({ success: !1, data: z });
            }), S(!0)) : (X(x), w.current = !w.current, e.current = !1);
          }, 800), { ...c, y: f.y };
        }
        const N = g > 0 ? T : -T, D = Math.sin(Date.now() * 6e-3) * 10;
        return { x: i.x + D, y: c.y + N };
      }), r = requestAnimationFrame(o);
    };
    return r = requestAnimationFrame(o), t.current.thief = r, () => cancelAnimationFrame(r);
  }, [u, W, M, T, R]);
  const C = () => {
    if (u || j) return;
    const r = m.x, o = m.y, c = y.x, f = y.y, g = 500, N = performance.now(), D = 48;
    n("shoot", { startX: r, startY: o, targetX: c, targetY: f });
    const x = (z) => {
      const H = Math.min(1, (z - N) / g), ne = r + (c - r) * H, oe = o + (f - o) * H;
      _({ x: ne, y: oe });
      const ue = h.x - y.x, fe = h.y - y.y, se = Math.sqrt(ue * ue + fe * fe);
      if (se <= D && !u) {
        n("hit", { distance: se }), F(!0), J(!0), V(!0), P("💥 Boom! Thief kicked!"), cancelAnimationFrame(t.current.arrow);
        let ae = { ...h };
        const ve = 600, xe = performance.now(), de = (Ee) => {
          const B = Math.min(1, (Ee - xe) / ve);
          ae = { ...ae, y: h.y + B * 80, x: h.x + B * 20, rotation: B * 180 }, A(ae), B < 1 ? requestAnimationFrame(de) : (J(!1), V(!1), S(!0), s(!0).then((be) => {
            d && d({ success: !0, data: be });
          }));
        };
        requestAnimationFrame(de);
        return;
      }
      H < 1 && !u ? t.current.arrow = requestAnimationFrame(x) : (u || P("❌ Missed! Try again!"), n("miss", { distance: se }), setTimeout(() => _(null), 500));
    };
    t.current.arrow = requestAnimationFrame(x);
  }, G = () => {
    F(!1), X(0), A({ ...i }), P("🎯 Drag the target and throw the stick!"), _(null), S(!1), w.current = !0, e.current = !1, U({ x: l.x + 30, y: l.y + 20 }), $([]), I.current = crypto.randomUUID();
  };
  return W ? /* @__PURE__ */ a.jsxs(
    "div",
    {
      style: {
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #2196f3, #4caf50)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Poppins, sans-serif"
      },
      children: [
        /* @__PURE__ */ a.jsx("h1", { style: { fontSize: 36 }, children: u ? "🎉 Mission Complete!" : "🚨 Mission Failed!" }),
        /* @__PURE__ */ a.jsx("h2", { style: { fontSize: 22, marginBottom: 20 }, children: u ? "You caught the thief!" : "The thief escaped! Verification failed." }),
        /* @__PURE__ */ a.jsx(
          "button",
          {
            onClick: G,
            style: {
              background: "#fff",
              color: "#333",
              padding: "10px 22px",
              fontSize: 16,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: "bold"
            },
            children: "🔁 Play Again"
          }
        )
      ]
    }
  ) : /* @__PURE__ */ a.jsx(
    "div",
    {
      style: {
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #2196f3, #4caf50)"
      },
      children: /* @__PURE__ */ a.jsxs(
        "div",
        {
          style: {
            position: "relative",
            width: 600,
            height: 400,
            background: "linear-gradient(to bottom, #b3e5fc, #a5d6a7)",
            border: "3px solid #333",
            borderRadius: 12,
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ a.jsxs(
              "div",
              {
                style: {
                  position: "absolute",
                  top: l.y,
                  left: l.x,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                },
                children: [
                  /* @__PURE__ */ a.jsx("span", { style: { fontSize: 14, fontWeight: "bold", marginBottom: 2 }, children: "Bank" }),
                  /* @__PURE__ */ a.jsx("div", { style: { fontSize: 40 }, children: "🏦" })
                ]
              }
            ),
            /* @__PURE__ */ a.jsxs(
              "div",
              {
                style: {
                  position: "absolute",
                  top: i.y,
                  left: i.x,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                },
                children: [
                  /* @__PURE__ */ a.jsx("span", { style: { fontSize: 14, fontWeight: "bold", marginBottom: 2 }, children: "Home" }),
                  /* @__PURE__ */ a.jsx("div", { style: { fontSize: 40 }, children: "🏠" })
                ]
              }
            ),
            /* @__PURE__ */ a.jsx(
              "div",
              {
                style: {
                  position: "absolute",
                  top: m.y - 25,
                  left: m.x - 25,
                  fontSize: 36
                },
                children: "👮‍♂️"
              }
            ),
            /* @__PURE__ */ a.jsxs(
              "div",
              {
                style: {
                  position: "absolute",
                  top: E.y,
                  left: E.x,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                },
                children: [
                  /* @__PURE__ */ a.jsx("span", { style: { fontSize: 14, fontWeight: "bold", marginBottom: 2 }, children: "Police Station" }),
                  /* @__PURE__ */ a.jsx("div", { style: { fontSize: 36 }, children: "🏢" })
                ]
              }
            ),
            /* @__PURE__ */ a.jsx(
              "div",
              {
                style: {
                  position: "absolute",
                  top: h.y,
                  left: h.x,
                  fontSize: 36,
                  transform: R ? `rotate(${h.rotation || 0}deg)` : void 0
                },
                children: u ? "💀" : "🕵️‍♂️"
              }
            ),
            j && /* @__PURE__ */ a.jsx("div", { style: { position: "absolute", left: j.x, top: j.y, fontSize: 28 }, children: "🪃" }),
            /* @__PURE__ */ a.jsx(
              "div",
              {
                onPointerDown: (r) => {
                  r.preventDefault();
                  const o = r.clientX, c = r.clientY, f = y.x, g = y.y, N = (x) => {
                    const z = x.clientX - o, H = x.clientY - c, ne = Math.max(20, Math.min(580, f + z)), oe = Math.max(20, Math.min(380, g + H));
                    U({ x: ne, y: oe });
                  }, D = () => {
                    document.removeEventListener("pointermove", N), document.removeEventListener("pointerup", D);
                  };
                  document.addEventListener("pointermove", N), document.addEventListener("pointerup", D);
                },
                style: {
                  position: "absolute",
                  left: y.x - 20,
                  top: y.y - 20,
                  width: 40,
                  height: 40,
                  border: "2px solid red",
                  borderRadius: "50%"
                }
              }
            ),
            !u && /* @__PURE__ */ a.jsx(
              "button",
              {
                onClick: C,
                style: {
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  padding: "8px 16px",
                  backgroundColor: "#1565C0",
                  color: "white",
                  border: "none",
                  borderRadius: 6
                },
                children: "Throw Stick 🪃"
              }
            ),
            /* @__PURE__ */ a.jsxs(
              "div",
              {
                style: {
                  position: "absolute",
                  bottom: 4,
                  left: "50%",
                  transform: "translateX(-50%)"
                },
                children: [
                  K,
                  " (Trip: ",
                  M,
                  "/",
                  b * 2,
                  ")"
                ]
              }
            )
          ]
        }
      )
    }
  );
}
export {
  we as default
};
