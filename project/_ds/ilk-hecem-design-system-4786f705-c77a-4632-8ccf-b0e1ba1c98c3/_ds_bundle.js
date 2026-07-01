/* @ds-bundle: {"format":3,"namespace":"LkHecemDesignSystem_4786f7","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"StarRating","sourcePath":"components/core/StarRating.jsx"},{"name":"FeatureCard","sourcePath":"components/patterns/FeatureCard.jsx"},{"name":"ProgramCard","sourcePath":"components/patterns/ProgramCard.jsx"},{"name":"TestimonialCard","sourcePath":"components/patterns/TestimonialCard.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"068b94870a1d","components/core/Badge.jsx":"b24cae1f8f92","components/core/Button.jsx":"c6a9cc3986ff","components/core/Card.jsx":"b7e3e04e599e","components/core/Eyebrow.jsx":"8f3c178137cc","components/core/Input.jsx":"68bac3edd084","components/core/StarRating.jsx":"e4ef98f9da97","components/patterns/FeatureCard.jsx":"def0dc46d9ed","components/patterns/ProgramCard.jsx":"977dda4492c1","components/patterns/TestimonialCard.jsx":"a49e5932f7e6","ui_kits/website/App.js":"07647538c4d8","ui_kits/website/Decor.js":"974fb579724f","ui_kits/website/Icons.js":"1e8169cdaa25","ui_kits/website/SectionsBottom.js":"43e9e0c320df","ui_kits/website/SectionsTop.js":"b51ad95986a7"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LkHecemDesignSystem_4786f7 = window.LkHecemDesignSystem_4786f7 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
/**
 * İlk Hecem — Avatar
 * Round photo (or colored initial) with a soft ring. Used for
 * testimonial authors and teacher cards.
 */
function Avatar({
  src = null,
  name = '',
  size = 48,
  ring = 'sky',
  style = {}
}) {
  const ringColor = {
    sky: 'var(--sky-200)',
    coral: 'var(--coral-200)',
    mint: 'var(--mint-200)',
    sun: 'var(--sun-200)',
    pink: 'var(--pink-200)',
    grape: 'var(--grape-200)'
  }[ring] || 'var(--sky-200)';
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: 999,
      flexShrink: 0,
      background: src ? `center / cover no-repeat url(${src})` : 'var(--sky-100)',
      boxShadow: `0 0 0 3px var(--white), 0 0 0 6px ${ringColor}`,
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: size * 0.36,
      color: 'var(--sky-700)',
      overflow: 'hidden',
      ...style
    }
  }, !src && initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * İlk Hecem — Badge / Pill
 * Small rounded label. Used for eyebrows, "Yeni", rating chips,
 * program tags. Soft tinted background + matching deep text.
 */
function Badge({
  children,
  color = 'sky',
  variant = 'soft',
  size = 'md',
  iconLeft = null,
  style = {},
  ...rest
}) {
  const palettes = {
    sky: {
      soft: 'var(--sky-100)',
      solidBg: 'var(--sky-500)',
      text: 'var(--sky-700)'
    },
    coral: {
      soft: 'var(--coral-100)',
      solidBg: 'var(--coral-400)',
      text: 'var(--coral-700)'
    },
    mint: {
      soft: 'var(--mint-100)',
      solidBg: 'var(--mint-400)',
      text: 'var(--mint-700)'
    },
    sun: {
      soft: 'var(--sun-100)',
      solidBg: 'var(--sun-400)',
      text: 'var(--sun-700)'
    },
    pink: {
      soft: 'var(--pink-100)',
      solidBg: 'var(--pink-300)',
      text: 'var(--pink-700)'
    },
    grape: {
      soft: 'var(--grape-100)',
      solidBg: 'var(--grape-400)',
      text: 'var(--grape-700)'
    },
    ink: {
      soft: 'var(--grey-100)',
      solidBg: 'var(--ink-800)',
      text: 'var(--ink-800)'
    }
  };
  const p = palettes[color] || palettes.sky;
  const sizes = {
    sm: {
      padding: '4px 10px',
      font: 'var(--fs-xs)',
      icon: 13
    },
    md: {
      padding: '6px 14px',
      font: 'var(--fs-sm)',
      icon: 15
    }
  };
  const s = sizes[size] || sizes.md;
  const styleByVariant = variant === 'solid' ? {
    background: p.solidBg,
    color: 'var(--white)'
  } : variant === 'outline' ? {
    background: 'transparent',
    color: p.text,
    boxShadow: `inset 0 0 0 2px ${p.soft}`
  } : {
    background: p.soft,
    color: p.text
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: s.padding,
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-extra)',
      fontSize: s.font,
      letterSpacing: '0.02em',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      ...styleByVariant,
      ...style
    }
  }, rest), iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: s.icon,
      height: s.icon
    }
  }, iconLeft), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * İlk Hecem — Button
 * Rounded, pillowy, friendly. The primary conversion control on the
 * site is the WhatsApp variant. Hover lifts + brightens; press settles.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  pill = true,
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  disabled = false,
  as = 'button',
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '9px 18px',
      font: 'var(--fs-sm)',
      gap: '7px',
      icon: 16,
      minH: 38
    },
    md: {
      padding: '13px 26px',
      font: 'var(--fs-base)',
      gap: '9px',
      icon: 19,
      minH: 48
    },
    lg: {
      padding: '18px 36px',
      font: 'var(--fs-lead)',
      gap: '11px',
      icon: 22,
      minH: 60
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      background: 'var(--color-primary)',
      color: 'var(--white)',
      boxShadow: 'var(--shadow-sky)',
      border: '2px solid transparent'
    },
    accent: {
      background: 'var(--color-accent)',
      color: 'var(--white)',
      boxShadow: 'var(--shadow-coral)',
      border: '2px solid transparent'
    },
    sunshine: {
      background: 'var(--sun-400)',
      color: 'var(--ink-900)',
      boxShadow: 'var(--shadow-sun)',
      border: '2px solid transparent'
    },
    whatsapp: {
      background: 'var(--color-whatsapp)',
      color: 'var(--white)',
      boxShadow: 'var(--shadow-whatsapp)',
      border: '2px solid transparent'
    },
    outline: {
      background: 'var(--white)',
      color: 'var(--text-body)',
      boxShadow: 'var(--shadow-sm)',
      border: '2px solid var(--grey-200)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-body)',
      boxShadow: 'none',
      border: '2px solid transparent'
    }
  };
  const v = variants[variant] || variants.primary;
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    disabled: as === 'button' ? disabled : undefined,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      padding: s.padding,
      minHeight: s.minH,
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: s.font,
      lineHeight: 1,
      letterSpacing: '0.01em',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      cursor: disabled ? 'not-allowed' : 'pointer',
      borderRadius: pill ? 'var(--radius-pill)' : 'var(--radius-lg)',
      transition: 'transform var(--dur-base) var(--ease-bounce), box-shadow var(--dur-base) var(--ease-out), filter var(--dur-fast) var(--ease-out)',
      opacity: disabled ? 0.5 : 1,
      ...v,
      ...style
    },
    onMouseEnter: e => {
      if (!disabled) {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
        e.currentTarget.style.filter = 'brightness(1.06)';
      }
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.filter = 'none';
    },
    onMouseDown: e => {
      if (!disabled) e.currentTarget.style.transform = 'translateY(1px) scale(0.97)';
    },
    onMouseUp: e => {
      if (!disabled) e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
    }
  }, rest), iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: s.icon,
      height: s.icon
    }
  }, iconLeft), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: s.icon,
      height: s.icon
    }
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * İlk Hecem — Card
 * Soft white rounded surface with a tinted lift shadow. Optional
 * colored top accent bar and a subtle hover lift. The default
 * container for content blocks across the site.
 */
function Card({
  children,
  accent = null,
  // 'sky' | 'coral' | 'mint' | 'sun' | 'pink' | 'grape'
  interactive = false,
  padding = 'var(--space-6)',
  radius = 'var(--radius-xl)',
  style = {},
  ...rest
}) {
  const accentColor = accent ? {
    sky: 'var(--sky-500)',
    coral: 'var(--coral-400)',
    mint: 'var(--mint-400)',
    sun: 'var(--sun-400)',
    pink: 'var(--pink-300)',
    grape: 'var(--grape-400)'
  }[accent] : null;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      borderRadius: radius,
      padding,
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      border: '1px solid var(--border-card)',
      overflow: 'hidden',
      transform: hover ? 'translateY(-6px)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-bounce), box-shadow var(--dur-base) var(--ease-out)',
      ...style
    }
  }, rest), accentColor && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      insetInline: 0,
      top: 0,
      height: 6,
      background: accentColor
    }
  }), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * İlk Hecem — Eyebrow
 * Small uppercase label that sits above section titles. Optionally
 * paired with a leading dot/icon in an accent color.
 */
function Eyebrow({
  children,
  color = 'coral',
  dot = true,
  style = {},
  ...rest
}) {
  const c = {
    sky: 'var(--sky-500)',
    coral: 'var(--coral-500)',
    mint: 'var(--mint-500)',
    sun: 'var(--sun-600)',
    pink: 'var(--pink-500)',
    grape: 'var(--grape-500)'
  }[color] || 'var(--coral-500)';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-extra)',
      fontSize: 'var(--fs-eyebrow)',
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      color: c,
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: c,
      display: 'inline-block'
    }
  }), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * İlk Hecem — Input
 * Rounded, generous text field for the contact / appointment form.
 * Soft border, sky focus ring. Pairs with a label + optional icon.
 */
function Input({
  label = null,
  type = 'text',
  placeholder = '',
  iconLeft = null,
  required = false,
  textarea = false,
  rows = 4,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const fieldId = id || (label ? `f-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: iconLeft ? '14px 16px 14px 46px' : '14px 18px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--fs-base)',
    fontWeight: 'var(--weight-medium)',
    color: 'var(--text-body)',
    background: 'var(--white)',
    border: `2px solid ${focus ? 'var(--sky-400)' : 'var(--grey-200)'}`,
    borderRadius: textarea ? 'var(--radius-md)' : 'var(--radius-pill)',
    boxShadow: focus ? 'var(--focus-ring)' : 'var(--shadow-xs)',
    outline: 'none',
    resize: textarea ? 'vertical' : undefined,
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
    ...style
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: 'block'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: 8,
      paddingLeft: 6,
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-medium)',
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-strong)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--coral-500)'
    }
  }, " *")), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'block'
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 16,
      top: textarea ? 16 : '50%',
      transform: textarea ? 'none' : 'translateY(-50%)',
      width: 20,
      height: 20,
      color: 'var(--ink-400)',
      display: 'inline-flex',
      pointerEvents: 'none'
    }
  }, iconLeft), textarea ? /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    rows: rows,
    placeholder: placeholder,
    required: required,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    onFocusCapture: () => setFocus(true),
    style: fieldStyle
  }, rest)) : /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: type,
    placeholder: placeholder,
    required: required,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: fieldStyle
  }, rest))));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/StarRating.jsx
try { (() => {
/**
 * İlk Hecem — StarRating
 * Friendly filled stars in sunshine yellow. Read-only display used
 * on testimonials and the Google rating chip.
 */
function StarRating({
  value = 5,
  max = 5,
  size = 20,
  showValue = false,
  style = {}
}) {
  const Star = ({
    fill
  }) => /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2.5l2.7 5.85 6.3.62-4.74 4.3 1.36 6.23L12 16.9l-5.62 2.6 1.36-6.23L3 8.97l6.3-.62L12 2.5z",
    fill: fill ? 'var(--color-star)' : 'var(--grey-200)',
    stroke: fill ? 'var(--sun-500)' : 'transparent',
    strokeWidth: "1",
    strokeLinejoin: "round"
  }));
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      ...style
    },
    "aria-label": `${value} / ${max}`
  }, Array.from({
    length: max
  }).map((_, i) => /*#__PURE__*/React.createElement(Star, {
    key: i,
    fill: i < Math.round(value)
  })), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-strong)'
    }
  }, value.toFixed(1)));
}
Object.assign(__ds_scope, { StarRating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StarRating.jsx", error: String((e && e.message) || e) }); }

// components/patterns/FeatureCard.jsx
try { (() => {
/**
 * İlk Hecem — FeatureCard
 * "Neden İlk Hecem" reassurance item: a small colored icon chip,
 * a title and a supporting line. Horizontal layout, no heavy border.
 */
function FeatureCard({
  icon,
  title,
  description,
  accent = 'mint',
  style = {}
}) {
  const a = {
    sky: {
      bg: 'var(--sky-100)',
      fg: 'var(--sky-600)'
    },
    coral: {
      bg: 'var(--coral-100)',
      fg: 'var(--coral-600)'
    },
    mint: {
      bg: 'var(--mint-100)',
      fg: 'var(--mint-600)'
    },
    sun: {
      bg: 'var(--sun-100)',
      fg: 'var(--sun-700)'
    },
    pink: {
      bg: 'var(--pink-100)',
      fg: 'var(--pink-600)'
    },
    grape: {
      bg: 'var(--grape-100)',
      fg: 'var(--grape-600)'
    }
  }[accent] || {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      alignItems: 'flex-start',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 56,
      height: 56,
      borderRadius: 'var(--radius-md)',
      background: a.bg,
      color: a.fg
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      display: 'inline-flex'
    }
  }, icon)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '4px 0 6px',
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--fs-h4)',
      color: 'var(--text-strong)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-base)',
      lineHeight: 'var(--leading-normal)',
      color: 'var(--text-muted)'
    }
  }, description)));
}
Object.assign(__ds_scope, { FeatureCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/patterns/FeatureCard.jsx", error: String((e && e.message) || e) }); }

// components/patterns/ProgramCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * İlk Hecem — ProgramCard
 * A branş dersi tile: big rounded icon medallion in an accent color,
 * title + short description. Hover lifts and wiggles the icon.
 * Used in the "Branş Dersleri / Programs" grid.
 */
function ProgramCard({
  icon,
  title,
  description,
  accent = 'sky',
  style = {},
  ...rest
}) {
  const a = {
    sky: {
      bg: 'var(--sky-100)',
      fg: 'var(--sky-600)',
      glow: 'var(--sky-200)'
    },
    coral: {
      bg: 'var(--coral-100)',
      fg: 'var(--coral-600)',
      glow: 'var(--coral-200)'
    },
    mint: {
      bg: 'var(--mint-100)',
      fg: 'var(--mint-600)',
      glow: 'var(--mint-200)'
    },
    sun: {
      bg: 'var(--sun-100)',
      fg: 'var(--sun-700)',
      glow: 'var(--sun-200)'
    },
    pink: {
      bg: 'var(--pink-100)',
      fg: 'var(--pink-600)',
      glow: 'var(--pink-200)'
    },
    grape: {
      bg: 'var(--grape-100)',
      fg: 'var(--grape-600)',
      glow: 'var(--grape-200)'
    }
  }[accent] || {};
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-6)',
      border: '1px solid var(--border-card)',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      transform: hover ? 'translateY(-8px)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-bounce), box-shadow var(--dur-base) var(--ease-out)',
      cursor: 'pointer',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 72,
      height: 72,
      borderRadius: 'var(--radius-lg)',
      background: a.bg,
      color: a.fg,
      marginBottom: 'var(--space-4)',
      boxShadow: hover ? `0 10px 22px ${a.glow}` : 'none',
      transform: hover ? 'rotate(-6deg) scale(1.06)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-bounce), box-shadow var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      display: 'inline-flex'
    }
  }, icon)), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 8px',
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--fs-h3)',
      color: 'var(--text-strong)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-base)',
      lineHeight: 'var(--leading-normal)',
      color: 'var(--text-muted)'
    }
  }, description));
}
Object.assign(__ds_scope, { ProgramCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/patterns/ProgramCard.jsx", error: String((e && e.message) || e) }); }

// components/patterns/TestimonialCard.jsx
try { (() => {
/**
 * İlk Hecem — TestimonialCard
 * Parent quote with a soft quotation mark, star rating, and author
 * row (avatar + name + relation). Warm white card.
 */
function TestimonialCard({
  quote,
  name,
  relation,
  rating = 5,
  avatar = null,
  ring = 'pink',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("figure", {
    style: {
      margin: 0,
      position: 'relative',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-6)',
      border: '1px solid var(--border-card)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      top: 14,
      right: 24,
      fontFamily: 'var(--font-display)',
      fontSize: 76,
      lineHeight: 1,
      color: 'var(--sky-100)',
      fontWeight: 700
    }
  }, "\u201D"), /*#__PURE__*/React.createElement(__ds_scope.StarRating, {
    value: rating,
    size: 18
  }), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--leading-relaxed)',
      color: 'var(--text-body)',
      fontWeight: 'var(--weight-medium)'
    }
  }, quote), /*#__PURE__*/React.createElement("figcaption", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginTop: 'auto'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    src: avatar,
    name: name,
    ring: ring,
    size: 48
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--fs-base)',
      color: 'var(--text-strong)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)'
    }
  }, relation))));
}
Object.assign(__ds_scope, { TestimonialCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/patterns/TestimonialCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/App.js
try { (() => {
/* İlk Hecem — website UI kit assembly */

/* Error boundary so a failure in any single section can never blank the page. */
class SectionBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      failed: false
    };
  }
  static getDerivedStateFromError() {
    return {
      failed: true
    };
  }
  componentDidCatch(err, info) {
    console.error('[İlk Hecem] section error:', err, info);
  }
  render() {
    if (this.state.failed) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '48px var(--gutter)',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          color: 'var(--text-muted)'
        }
      }, "Bu b\xF6l\xFCm y\xFCklenirken bir sorun olu\u015Ftu.");
    }
    return this.props.children;
  }
}
const B = ({
  children
}) => /*#__PURE__*/React.createElement(SectionBoundary, null, children);
function App() {
  const go = id => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.SiteHeader, {
    go: go
  })), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.Hero, {
    go: go
  })), /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.About, null)), /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.Philosophy, null)), /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.Programs, null)), /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.WhyUs, null)), /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.Gallery, null)), /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.Testimonials, null)), /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.FAQ, null)), /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.Contact, null))), /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.SiteFooter, {
    go: go
  })), /*#__PURE__*/React.createElement(B, null, /*#__PURE__*/React.createElement(window.FloatingWhatsApp, null)));
}

/* Guard against double createRoot (e.g. hot reload) which can unmount the tree. */
const _ihRootEl = document.getElementById('root');
if (!window.__ihRoot) window.__ihRoot = ReactDOM.createRoot(_ihRootEl);
window.__ihRoot.render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/App.js", error: String((e && e.message) || e) }); }

// ui_kits/website/Decor.js
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* İlk Hecem — shared decoration + layout helpers for the website UI kit. */

const WA_NUMBER = '905438626706';
const WA_LINK = msg => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg || 'Merhaba, İlk Hecem Anaokulu hakkında bilgi almak istiyorum.')}`;
const MAPS_LINK = 'https://maps.google.com/?q=İlk+Hecem+Anaokulu+Tuzla+İstanbul';

/* Soft blurred color blob */
const Blob = ({
  color,
  size = 120,
  top,
  left,
  right,
  bottom,
  delay = 0,
  dur = 6
}) => /*#__PURE__*/React.createElement("span", {
  "aria-hidden": "true",
  style: {
    position: 'absolute',
    width: size,
    height: size,
    top,
    left,
    right,
    bottom,
    background: `var(--${color})`,
    borderRadius: 'var(--radius-blob)',
    filter: 'blur(6px)',
    opacity: 0.5,
    animation: `ih-float ${dur}s ${delay}s ease-in-out infinite`
  }
});

/* Small twinkling dot */
const Dot = ({
  color,
  size = 12,
  top,
  left,
  right,
  bottom,
  delay = 0
}) => /*#__PURE__*/React.createElement("span", {
  "aria-hidden": "true",
  style: {
    position: 'absolute',
    width: size,
    height: size,
    top,
    left,
    right,
    bottom,
    background: `var(--${color})`,
    borderRadius: 999,
    animation: `ih-twinkle 3s ${delay}s ease-in-out infinite`
  }
});

/* Fluffy SVG cloud that drifts slowly across the page (left → right). */
const Cloud = ({
  w = 120,
  top,
  delay = 0,
  dur = 64,
  opacity = 0.92
}) => /*#__PURE__*/React.createElement("span", {
  "aria-hidden": "true",
  style: {
    position: 'absolute',
    top,
    left: 0,
    width: w,
    opacity,
    willChange: 'transform',
    filter: 'drop-shadow(0 10px 16px rgba(39,30,107,0.10))',
    animation: `ih-drift ${dur}s ${delay}s linear infinite`
  }
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 132 78",
  width: "100%",
  style: {
    display: 'block'
  }
}, /*#__PURE__*/React.createElement("g", {
  fill: "#ffffff"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "40",
  cy: "47",
  r: "25"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "69",
  cy: "31",
  r: "30"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "98",
  cy: "49",
  r: "22"
}), /*#__PURE__*/React.createElement("rect", {
  x: "31",
  y: "47",
  width: "76",
  height: "27",
  rx: "13.5"
}))));

/* A page-wide drifting cloud layer to drop into a Section's `decor` slot.
   Clouds sit BEHIND the section content and cross the screen very slowly. */
const CloudField = ({
  density = 3
}) => {
  const presets = [{
    w: 134,
    top: '10%',
    dur: 78,
    delay: -8,
    opacity: 0.92
  }, {
    w: 86,
    top: '44%',
    dur: 104,
    delay: -55,
    opacity: 0.7
  }, {
    w: 68,
    top: '72%',
    dur: 66,
    delay: -34,
    opacity: 0.6
  }, {
    w: 110,
    top: '28%',
    dur: 92,
    delay: -70,
    opacity: 0.8
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, presets.slice(0, density).map((p, i) => /*#__PURE__*/React.createElement(Cloud, _extends({
    key: i
  }, p))));
};

/* Floating star (uses the StarLn icon) */
const FloatStar = ({
  color = 'sun-400',
  size = 22,
  top,
  left,
  right,
  bottom,
  delay = 0,
  dur = 7
}) => /*#__PURE__*/React.createElement("span", {
  "aria-hidden": "true",
  style: {
    position: 'absolute',
    width: size,
    height: size,
    top,
    left,
    right,
    bottom,
    color: `var(--${color})`,
    animation: `ih-bob ${dur}s ${delay}s ease-in-out infinite`
  }
}, /*#__PURE__*/React.createElement(StarLn, null));

/* Balloon */
const Balloon = ({
  color = 'coral-300',
  size = 40,
  top,
  left,
  right,
  bottom,
  delay = 0,
  dur = 8
}) => /*#__PURE__*/React.createElement("span", {
  "aria-hidden": "true",
  style: {
    position: 'absolute',
    top,
    left,
    right,
    bottom,
    animation: `ih-float ${dur}s ${delay}s ease-in-out infinite`
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'block',
    width: size,
    height: size * 1.2,
    background: `var(--${color})`,
    borderRadius: '50% 50% 48% 48% / 55% 55% 45% 45%',
    boxShadow: 'inset -6px -8px 0 rgba(0,0,0,0.06)'
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'block',
    width: 1,
    height: size * 0.5,
    background: 'var(--grey-300)',
    margin: '0 auto'
  }
}));

/* Branded photo. Pass `src` for a real image; otherwise renders a tinted
   placeholder. `focus` sets object-position (e.g. 'center 30%'). */
const Photo = ({
  label = 'Fotoğraf',
  tint = 'sky',
  radius = 'var(--radius-xl)',
  src = null,
  focus = 'center',
  style = {}
}) => {
  const map = {
    sky: ['var(--sky-100)', 'var(--sky-200)', 'var(--sky-600)'],
    coral: ['var(--coral-100)', 'var(--coral-200)', 'var(--coral-600)'],
    mint: ['var(--mint-100)', 'var(--mint-200)', 'var(--mint-600)'],
    sun: ['var(--sun-100)', 'var(--sun-200)', 'var(--sun-700)'],
    pink: ['var(--pink-100)', 'var(--pink-200)', 'var(--pink-600)'],
    grape: ['var(--grape-100)', 'var(--grape-200)', 'var(--grape-600)']
  };
  const [a, b, fg] = map[tint] || map.sky;
  if (src) {
    return /*#__PURE__*/React.createElement("img", {
      src: src,
      alt: label,
      loading: "lazy",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: focus,
        borderRadius: radius,
        display: 'block',
        ...style
      }
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: radius,
      overflow: 'hidden',
      background: `linear-gradient(135deg, ${a}, ${b})`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      color: fg,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      opacity: 0.8
    }
  }, /*#__PURE__*/React.createElement(Camera, null)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 15,
      opacity: 0.9
    }
  }, label));
};

/* Section heading: eyebrow + title (+ optional lead), centered or left */
const SectionHead = ({
  eyebrow,
  eyebrowColor = 'coral',
  title,
  lead,
  align = 'center',
  maxWidth = 640,
  light = false
}) => {
  const {
    Eyebrow
  } = window.LkHecemDesignSystem_4786f7;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: align,
      maxWidth,
      margin: align === 'center' ? '0 auto' : 0
    }
  }, eyebrow && /*#__PURE__*/React.createElement(Eyebrow, {
    color: eyebrowColor,
    style: {
      justifyContent: align === 'center' ? 'center' : 'flex-start'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--fs-display)',
      lineHeight: 'var(--leading-tight)',
      letterSpacing: 'var(--tracking-tight)',
      color: light ? 'var(--white)' : 'var(--text-strong)',
      margin: '14px 0 0'
    }
  }, title), lead && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--leading-relaxed)',
      color: light ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)',
      margin: '16px auto 0',
      maxWidth: align === 'center' ? 560 : '100%'
    }
  }, lead));
};

/* A simple section wrapper with consistent rhythm + container.
   `decor` renders at section level (behind the content container). */
const Section = ({
  id,
  children,
  bg,
  style = {},
  container = 1200,
  decor = null
}) => /*#__PURE__*/React.createElement("section", {
  id: id,
  style: {
    padding: 'var(--section-y) 0',
    background: bg,
    position: 'relative',
    ...style
  }
}, decor, /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: container,
    margin: '0 auto',
    padding: '0 var(--gutter)',
    position: 'relative',
    zIndex: 1
  }
}, children));
Object.assign(window, {
  WA_NUMBER,
  WA_LINK,
  MAPS_LINK,
  Blob,
  Dot,
  Cloud,
  CloudField,
  FloatStar,
  Balloon,
  Photo,
  SectionHead,
  Section
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Decor.js", error: String((e && e.message) || e) }); }

// ui_kits/website/Icons.js
try { (() => {
/* İlk Hecem — Icon set (Lucide-style inline SVGs, 24×24, 2px round stroke).
   Stroke icons inherit currentColor. WhatsApp is the only filled brand glyph. */
const IcoBase = ({
  children,
  fill = 'none',
  size = '100%'
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  width: size,
  height: size,
  fill: fill,
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: {
    display: 'block'
  }
}, children);
const Globe = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 12h18"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"
}));
const Flask = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M9 3h6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10 3v6.5L4.8 18A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-3L14 9.5V3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 15h10"
}));
const Music = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M9 18V5l10-2v13"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "6",
  cy: "18",
  r: "3"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "16",
  cy: "16",
  r: "3"
}));
const Drama = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M5 4h6v6a3 3 0 0 1-6 0V4z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6.5 8.5a2 2 0 0 0 3 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M13 8h6v5a3 3 0 0 1-6 0V8z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14.5 11.5a2 2 0 0 0 3 0"
}));
const Chess = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M8 22h8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 22l1-5h4l1 5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 3a2 2 0 0 1 2 2c0 1-1 1.5-1 2.5 0 1 2 1.5 2 3 0 1.2-1.5 2-2 3H11c-.5-1-2-1.8-2-3 0-1.5 2-2 2-3 0-1-1-1.5-1-2.5a2 2 0 0 1 2-2z"
}));
const Values = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 21s-7-4.6-9.3-9A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 9.3 6C19 16.4 12 21 12 21z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9.5 11.5l1.7 1.7 3-3.2"
}));
const Palette = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 3a9 9 0 0 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.4-.6-.4-1 0-.9.7-1.5 1.6-1.5H16a5 5 0 0 0 5-5c0-4.2-4-7.5-9-7.5z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "7.5",
  cy: "11",
  r: "1"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "10.5",
  cy: "7.5",
  r: "1"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "14.5",
  cy: "7.5",
  r: "1"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "17",
  cy: "11",
  r: "1"
}));
const Robot = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("rect", {
  x: "5",
  y: "8",
  width: "14",
  height: "11",
  rx: "3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 8V5"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "4",
  r: "1.2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9.5",
  cy: "13",
  r: "1.1"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "14.5",
  cy: "13",
  r: "1.1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9.5 16.5h5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 12v3M21 12v3"
}));
const Shield = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 3l8 3v5c0 5-3.5 8.2-8 10-4.5-1.8-8-5-8-10V6z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 12l2 2 4-4"
}));
const Heart = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 21s-7-4.6-9.3-9A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 9.3 6C19 16.4 12 21 12 21z"
}));
const Sparkle = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 3l1.6 4.8L18 9.4l-4.4 1.6L12 16l-1.6-5L6 9.4l4.4-1.6z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"
}));
const Users = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "8",
  r: "3.2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3.5 20a5.5 5.5 0 0 1 11 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 5.2a3.2 3.2 0 0 1 0 6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M18 14.5a5.5 5.5 0 0 1 3 5"
}));
const Cap = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M2 9l10-4 10 4-10 4z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6 11v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M22 9v5"
}));
const Smile = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8.5 14.5a4 4 0 0 0 7 0"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "10",
  r: "0.6",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "15",
  cy: "10",
  r: "0.6",
  fill: "currentColor"
}));
const Leaf = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M5 19c0-8 6-13 14-13 0 8-5 13-13 13H5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 19c2-4 5-7 9-9"
}));
const Sun = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
}));
const Camera = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M3 8a2 2 0 0 1 2-2h2l1.5-2h7L19 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12.5",
  r: "3.2"
}));
const Clock = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 7v5l3 2"
}));
const Bus = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "5",
  width: "18",
  height: "11",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 11h18"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 5v6"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "7.5",
  cy: "18.5",
  r: "1.5"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "16.5",
  cy: "18.5",
  r: "1.5"
}));
const Phone = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5L19 12l4 1.5V17a2 2 0 0 1-2 2A16 16 0 0 1 5 6 2 2 0 0 1 5 4z",
  transform: "translate(-1 0)"
}));
const MapPin = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "10",
  r: "3"
}));
const Mail = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "5",
  width: "18",
  height: "14",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 7l9 6 9-6"
}));
const User = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "8",
  r: "4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 21a7 7 0 0 1 14 0"
}));
const Chat = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"
}));
const ArrowR = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h14M13 6l6 6-6 6"
}));
const ArrowUR = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M7 17L17 7M9 7h8v8"
}));
const Menu = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 7h16M4 12h16M4 17h16"
}));
const Close = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M6 6l12 12M18 6L6 18"
}));
const ChevD = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M6 9l6 6 6-6"
}));
const Plus = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 5v14M5 12h14"
}));
const Check = () => /*#__PURE__*/React.createElement(IcoBase, null, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8.5 12.5l2.2 2.2 4.8-5"
}));
const StarLn = () => /*#__PURE__*/React.createElement(IcoBase, {
  fill: "currentColor"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 3l2.6 5.7 6.4.6-4.8 4.3 1.4 6.4L12 17.2 6.4 20l1.4-6.4L3 9.3l6.4-.6z"
}));
const Quote = () => /*#__PURE__*/React.createElement(IcoBase, {
  fill: "currentColor"
}, /*#__PURE__*/React.createElement("path", {
  d: "M7 7h4v5a4 4 0 0 1-4 4V14a2 2 0 0 0 2-2H7zM15 7h4v5a4 4 0 0 1-4 4V14a2 2 0 0 0 2-2h-2z"
}));
const WhatsApp = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  width: "100%",
  height: "100%",
  fill: "currentColor",
  style: {
    display: 'block'
  }
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 1.9a8.1 8.1 0 0 1 6.9 12.4l-.4.6.8 2.9-3-.8-.5.3A8.1 8.1 0 1 1 12 3.9zm-3.9 4c-.2 0-.5 0-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3 2 3.2 5 4.4c2.5 1 3 .8 3.5.8.6 0 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4 0-.1-.3-.2-.6-.4l-2-1c-.3-.1-.5-.2-.7.1l-.7.9c-.2.2-.3.3-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6L9.5 8.6c-.2-.6-.5-.5-.7-.5h-.7z"
}));
Object.assign(window, {
  Globe,
  Flask,
  Music,
  Drama,
  Chess,
  Values,
  Palette,
  Robot,
  Shield,
  Heart,
  Sparkle,
  Users,
  Cap,
  Smile,
  Leaf,
  Sun,
  Camera,
  Clock,
  Bus,
  Phone,
  MapPin,
  Mail,
  User,
  Chat,
  ArrowR,
  ArrowUR,
  Menu,
  Close,
  ChevD,
  Plus,
  Check,
  StarLn,
  Quote,
  WhatsApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Icons.js", error: String((e && e.message) || e) }); }

// ui_kits/website/SectionsBottom.js
try { (() => {
/* İlk Hecem — website sections (bottom): WhyUs, Gallery, Testimonials, FAQ, Contact, Footer, FAB */
const DSB = window.LkHecemDesignSystem_4786f7;

/* --------------------------------- Why Us ---------------------------------- */
function WhyUs({}) {
  const {
    FeatureCard
  } = DSB;
  const feats = [['Shield', 'mint', 'Güvenli & Kameralı Kampüs', 'Güvenlikli giriş, kameralı ortam ve hijyenik alanlarla gönül rahatlığı.'], ['Cap', 'sky', 'Deneyimli Öğretmenler', 'Alanında uzman, sevgi dolu ve çocuk gelişimine hâkim bir kadro.'], ['Heart', 'pink', 'Bireysel İlgi', 'Düşük öğretmen-öğrenci oranıyla her çocuğa özel gelişim takibi.'], ['Sun', 'sun', 'Zengin Günlük Akış', 'Oyun, sanat, branş ve dinlenmenin dengelendiği dolu dolu bir gün.']];
  return /*#__PURE__*/React.createElement(window.Section, {
    id: "neden"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,0.85fr) minmax(0,1.15fr)',
      gap: 'clamp(32px,5vw,72px)',
      alignItems: 'center'
    },
    className: "ih-2col"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.SectionHead, {
    align: "left",
    eyebrow: "Neden \u0130lk Hecem?",
    eyebrowColor: "coral",
    title: "Aileler bize neden g\xFCveniyor?",
    lead: "\xC7\xFCnk\xFC \xE7ocu\u011Funuzun mutlulu\u011Fu ve g\xFCvenli\u011Fi her \u015Feyin \xF6n\xFCnde gelir."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 22px',
      background: 'var(--mint-50)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--mint-100)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      color: 'var(--mint-500)'
    }
  }, /*#__PURE__*/React.createElement(window.Check, null)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      color: 'var(--mint-700)'
    }
  }, "%100 veli memnuniyeti \u2014 Google'da 5.0 / 5"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24
    },
    className: "ih-grid-2"
  }, feats.map(([ico, tint, title, desc]) => {
    const Ic = window[ico];
    return /*#__PURE__*/React.createElement(FeatureCard, {
      key: title,
      accent: tint,
      icon: /*#__PURE__*/React.createElement(Ic, null),
      title: title,
      description: desc
    });
  }))));
}

/* --------------------------------- Gallery --------------------------------- */
function Gallery({}) {
  const tiles = [{
    label: 'Bahçe ve Oyun Alanı',
    src: '../../assets/gallery-bahce.jpeg',
    span: '2 / 2',
    focus: 'center 55%'
  }, {
    label: 'Sanat & Atölye',
    src: '../../assets/gallery-sanat.jpeg',
    span: '1 / 1',
    focus: 'center 38%'
  }, {
    label: 'Müzik Etkinliği',
    src: '../../assets/gallery-muzik.jpeg',
    span: '1 / 1',
    focus: 'center 50%'
  }, {
    label: 'Beslenme Saati',
    src: '../../assets/gallery-beslenme.jpeg',
    span: '1 / 1',
    focus: 'center 55%'
  }, {
    label: 'Okulumuz',
    src: '../../assets/gallery-okulumuz.webp',
    span: '2 / 1',
    focus: 'center 50%'
  }, {
    label: 'Doğa Etkinliği',
    src: '../../assets/gallery-doga.webp',
    span: '1 / 1',
    focus: 'center 55%'
  }];
  const [light, setLight] = React.useState(null);
  return /*#__PURE__*/React.createElement(window.Section, {
    id: "galeri",
    bg: "linear-gradient(180deg, var(--surface-page), var(--pink-50))",
    decor: /*#__PURE__*/React.createElement(window.CloudField, {
      density: 2
    })
  }, /*#__PURE__*/React.createElement(window.SectionHead, {
    eyebrow: "Galeri",
    eyebrowColor: "pink",
    title: "Okulumuzdan mutlu anlar",
    lead: "Minik \xF6\u011Frencilerimizin ke\u015Fif, oyun ve \xF6\u011Frenme dolu g\xFCnlerinden kareler."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridAutoRows: 150,
      gap: 16,
      marginTop: 44
    },
    className: "ih-gallery"
  }, tiles.map((t, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setLight(t),
    style: {
      gridColumn: t.span.split(' / ')[0] === '2' ? 'span 2' : 'span 1',
      gridRow: t.span.split(' / ')[1] === '2' ? 'span 2' : 'span 1',
      padding: 0,
      border: 'none',
      cursor: 'pointer',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      transition: 'transform var(--dur-base) var(--ease-bounce), box-shadow var(--dur-base)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = 'scale(1.03)';
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }
  }, /*#__PURE__*/React.createElement(window.Photo, {
    src: t.src,
    label: t.label,
    focus: t.focus,
    radius: "0"
  })))), light && /*#__PURE__*/React.createElement("div", {
    onClick: () => setLight(null),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 90,
      background: 'rgba(28,22,82,0.72)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 16,
      animation: 'ih-pop .25s var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 'min(720px, 92vw)',
      maxHeight: '78vh',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xl)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: light.src,
    alt: light.label,
    style: {
      width: '100%',
      maxHeight: '78vh',
      objectFit: 'contain',
      display: 'block',
      background: 'var(--ink-900)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 'var(--fs-h4)',
      color: 'var(--white)'
    }
  }, light.label)));
}

/* ------------------------------ Testimonials ------------------------------- */
function Testimonials({}) {
  const {
    TestimonialCard,
    StarRating,
    Button
  } = DSB;
  const items = [['Kızım her sabah okula koşarak gidiyor. Öğretmenler gerçekten çok ilgili ve sevgi dolu.', 'Ayşe K.', "Defne'nin annesi", 'pink'], ['Oğlumun özgüveni ve İngilizcesi inanılmaz gelişti. Gönül rahatlığıyla emanet ediyoruz.', 'Mehmet T.', "Aras'ın babası", 'sky'], ['Güvenli ortam, temiz sınıflar ve harika branş dersleri. İlk Hecem bir aile gibi.', 'Zeynep A.', "Mina'nın annesi", 'mint']];
  return /*#__PURE__*/React.createElement(window.Section, {
    id: "yorumlar"
  }, /*#__PURE__*/React.createElement(window.SectionHead, {
    eyebrow: "Veli Yorumlar\u0131",
    eyebrowColor: "sun",
    title: "Ailelerimiz ne diyor?",
    lead: "Velilerimizin g\xFCveni en b\xFCy\xFCk gururumuz."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(StarRating, {
    value: 5,
    size: 24
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 22,
      color: 'var(--ink-900)'
    }
  }, "5.0"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      color: 'var(--text-muted)'
    }
  }, "\xB7 Google'da 9 yorum")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 22,
      marginTop: 40
    },
    className: "ih-grid-3"
  }, items.map(([q, n, r, ring]) => /*#__PURE__*/React.createElement(TestimonialCard, {
    key: n,
    rating: 5,
    quote: q,
    name: n,
    relation: r,
    ring: ring
  }))));
}

/* ---------------------------------- FAQ ------------------------------------ */
function FAQ({}) {
  const qs = [['Kayıt için hangi yaş grubunu kabul ediyorsunuz?', '2 ile 6 yaş arası tüm minikleri ailemize katmaktan mutluluk duyuyoruz. Yaş gruplarına özel sınıflarımız bulunur.'], ['Servis hizmetiniz var mı?', 'Evet, Tuzla ve çevresine güvenli okul servisi hizmetimiz mevcuttur. Güzergâh detayları için WhatsApp\'tan bize ulaşabilirsiniz.'], ['Yemek ve beslenme nasıl sağlanıyor?', 'Okulumuzda dengeli ve çocuk dostu menülerle tam gün beslenme sağlanır. Özel beslenme ihtiyaçları için kayıt sırasında bilgi alıyoruz.'], ['Okulu ziyaret edip yerinde görebilir miyiz?', 'Elbette! Randevu oluşturarak kampüsümüzü gezebilir, öğretmenlerimizle tanışabilirsiniz. WhatsApp\'tan kolayca randevu alabilirsiniz.'], ['Çalışma saatleriniz nedir?', 'Hafta içi her gün 08:00 – 18:00 arası tam gün ve yarım gün seçenekleriyle hizmet veriyoruz.']];
  const [open, setOpen] = React.useState(0);
  return /*#__PURE__*/React.createElement(window.Section, {
    id: "sss",
    bg: "linear-gradient(180deg, var(--pink-50), var(--surface-page))",
    container: 840
  }, /*#__PURE__*/React.createElement(window.SectionHead, {
    eyebrow: "S\u0131k Sorulan Sorular",
    eyebrowColor: "grape",
    title: "Akl\u0131n\u0131zdaki sorular"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, qs.map(([q, a], i) => {
    const isOpen = open === i;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-card)',
        boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-xs)',
        overflow: 'hidden',
        transition: 'box-shadow var(--dur-base)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(isOpen ? -1 : i),
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '20px 24px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '1.1rem',
        color: 'var(--text-strong)'
      }
    }, q), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        flexShrink: 0,
        color: 'var(--sky-500)',
        transform: isOpen ? 'rotate(180deg)' : 'none',
        transition: 'transform var(--dur-base) var(--ease-bounce)'
      }
    }, /*#__PURE__*/React.createElement(window.ChevD, null))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxHeight: isOpen ? 200 : 0,
        transition: 'max-height var(--dur-slow) var(--ease-out)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        padding: '0 24px 22px',
        fontFamily: 'var(--font-body)',
        fontSize: '1.02rem',
        lineHeight: 1.6,
        color: 'var(--text-muted)'
      }
    }, a)));
  })));
}

/* -------------------------------- Contact ---------------------------------- */
function Contact({}) {
  const {
    Input,
    Button
  } = DSB;
  const [sent, setSent] = React.useState(false);
  const info = [['MapPin', 'coral', 'Adres', 'Mimar Sinan, Yeni Sk. No:28, 34950 Tuzla/İstanbul'], ['Phone', 'mint', 'Telefon / WhatsApp', '0543 862 67 06'], ['Clock', 'sky', 'Çalışma Saatleri', 'Hafta içi 08:00 – 18:00']];
  return /*#__PURE__*/React.createElement(window.Section, {
    id: "iletisim",
    bg: "linear-gradient(160deg, var(--sky-500), var(--grape-400))",
    style: {
      color: 'var(--white)'
    }
  }, /*#__PURE__*/React.createElement(window.Blob, {
    color: "sun-300",
    size: 120,
    top: 40,
    right: '8%',
    dur: 9
  }), /*#__PURE__*/React.createElement(window.Blob, {
    color: "pink-200",
    size: 90,
    bottom: 40,
    left: '5%',
    dur: 7,
    delay: 1
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
      gap: 'clamp(32px,5vw,64px)',
      alignItems: 'center'
    },
    className: "ih-2col"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.SectionHead, {
    align: "left",
    light: true,
    eyebrow: "\u0130leti\u015Fim",
    eyebrowColor: "sun",
    title: "Hadi tan\u0131\u015Fal\u0131m!",
    lead: "Tek t\u0131kla WhatsApp'tan bilgi al\u0131n ya da okulumuzu ziyaret i\xE7in randevu olu\u015Fturun. Sizi a\u011F\u0131rlamay\u0131 \xE7ok isteriz."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 30,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, info.map(([ico, tint, label, val]) => {
    const Ic = window[ico];
    return /*#__PURE__*/React.createElement("div", {
      key: label,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'rgba(255,255,255,0.16)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 48,
        height: 48,
        flexShrink: 0,
        borderRadius: 'var(--radius-md)',
        background: 'var(--white)',
        color: `var(--${tint}-500)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 26
      }
    }, /*#__PURE__*/React.createElement(Ic, null))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        opacity: 0.85,
        fontWeight: 700,
        letterSpacing: '0.02em'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '1.05rem'
      }
    }, val)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(Button, {
    as: "a",
    href: window.WA_LINK(),
    target: "_blank",
    rel: "noopener",
    variant: "whatsapp",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement(window.WhatsApp, null)
  }, "WhatsApp'tan Bilgi Al"), /*#__PURE__*/React.createElement(Button, {
    as: "a",
    href: window.MAPS_LINK,
    target: "_blank",
    rel: "noopener",
    variant: "sunshine",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement(window.MapPin, null)
  }, "Yol Tarifi Al"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      borderRadius: 'var(--radius-2xl)',
      padding: 'clamp(24px,3vw,36px)',
      boxShadow: 'var(--shadow-xl)'
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 72,
      height: 72,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      background: 'var(--mint-100)',
      color: 'var(--mint-500)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40
    }
  }, /*#__PURE__*/React.createElement(window.Check, null))), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--ink-900)',
      fontSize: 24,
      margin: '18px 0 6px'
    }
  }, "Te\u015Fekk\xFCrler!"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, "En k\u0131sa s\xFCrede size d\xF6n\xFC\u015F yapaca\u011F\u0131z.")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--fs-h3)',
      color: 'var(--ink-900)',
      margin: 0
    }
  }, "Randevu Olu\u015Ftur"), /*#__PURE__*/React.createElement(Input, {
    label: "Ad\u0131n\u0131z",
    placeholder: "Ad\u0131n\u0131z Soyad\u0131n\u0131z",
    iconLeft: /*#__PURE__*/React.createElement(window.User, null),
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Telefon",
    type: "tel",
    placeholder: "05XX XXX XX XX",
    iconLeft: /*#__PURE__*/React.createElement(window.Phone, null),
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Mesaj\u0131n\u0131z",
    textarea: true,
    rows: 3,
    placeholder: "\xC7ocu\u011Funuzun ya\u015F\u0131 ve sorular\u0131n\u0131z...",
    iconLeft: /*#__PURE__*/React.createElement(window.Chat, null)
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    size: "lg",
    fullWidth: true,
    iconRight: /*#__PURE__*/React.createElement(window.ArrowR, null)
  }, "Randevu Olu\u015Ftur")))));
}

/* --------------------------------- Footer ---------------------------------- */
function SiteFooter({
  go
}) {
  const links = [['hakkimizda', 'Hakkımızda'], ['branslar', 'Branş Dersleri'], ['galeri', 'Galeri'], ['yorumlar', 'Veli Yorumları'], ['sss', 'SSS'], ['iletisim', 'İletişim']];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--ink-900)',
      color: 'rgba(255,255,255,0.85)',
      padding: '56px 0 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: '0 auto',
      padding: '0 var(--gutter)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1.2fr',
      gap: 40
    },
    className: "ih-footer-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-ilk-hecem-transparent.png",
    alt: "\u0130lk Hecem Anaokulu",
    style: {
      height: 72,
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      lineHeight: 1.6,
      maxWidth: 300,
      color: 'rgba(255,255,255,0.7)'
    }
  }, "Mutlu \xC7ocuklar, Ayd\u0131nl\u0131k Yar\u0131nlar. Tuzla'da sevgi dolu, g\xFCvenli ve oyun temelli anaokulu.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--white)',
      fontSize: 17,
      margin: '0 0 14px'
    }
  }, "Ke\u015Ffet"), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, links.map(([id, l]) => /*#__PURE__*/React.createElement("li", {
    key: id
  }, /*#__PURE__*/React.createElement("a", {
    href: `#${id}`,
    onClick: e => {
      e.preventDefault();
      go(id);
    },
    style: {
      color: 'rgba(255,255,255,0.7)',
      textDecoration: 'none',
      fontFamily: 'var(--font-body)'
    }
  }, l))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--white)',
      fontSize: 17,
      margin: '0 0 14px'
    }
  }, "\u0130leti\u015Fim"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: 'var(--font-body)',
      color: 'rgba(255,255,255,0.7)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      flexShrink: 0,
      color: 'var(--sky-300)'
    }
  }, /*#__PURE__*/React.createElement(window.MapPin, null)), "Mimar Sinan, Yeni Sk. No:28, 34950 Tuzla/\u0130stanbul"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      flexShrink: 0,
      color: 'var(--mint-300)'
    }
  }, /*#__PURE__*/React.createElement(window.Phone, null)), "0543 862 67 06")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      paddingTop: 22,
      borderTop: '1px solid rgba(255,255,255,0.12)',
      textAlign: 'center',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'rgba(255,255,255,0.55)'
    }
  }, "\xA9 2026 \xD6zel Tuzla \u0130lk Hecem Anaokulu \xB7 T\xFCm haklar\u0131 sakl\u0131d\u0131r.")));
}

/* ----------------------------- Floating WhatsApp --------------------------- */
function FloatingWhatsApp() {
  return /*#__PURE__*/React.createElement("a", {
    href: window.WA_LINK(),
    target: "_blank",
    rel: "noopener",
    "aria-label": "WhatsApp'tan yaz\u0131n",
    style: {
      position: 'fixed',
      right: 22,
      bottom: 22,
      zIndex: 80,
      width: 62,
      height: 62,
      borderRadius: 999,
      background: 'var(--color-whatsapp)',
      color: 'var(--white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'var(--shadow-whatsapp)',
      textDecoration: 'none',
      animation: 'ih-float 4s ease-in-out infinite'
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = 'scale(1.08)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'none';
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 999,
      background: 'var(--color-whatsapp)',
      opacity: 0.5,
      animation: 'ih-twinkle 2.5s ease-in-out infinite',
      zIndex: -1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 34
    }
  }, /*#__PURE__*/React.createElement(window.WhatsApp, null)));
}
Object.assign(window, {
  WhyUs,
  Gallery,
  Testimonials,
  FAQ,
  Contact,
  SiteFooter,
  FloatingWhatsApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/SectionsBottom.js", error: String((e && e.message) || e) }); }

// ui_kits/website/SectionsTop.js
try { (() => {
/* İlk Hecem — website sections (top): Header, Hero, About, Philosophy, Programs */
const DS = window.LkHecemDesignSystem_4786f7;

/* ---------------------------------- Header --------------------------------- */
function SiteHeader({
  go
}) {
  const {
    Button
  } = DS;
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [['hakkimizda', 'Hakkımızda'], ['branslar', 'Branş Dersleri'], ['neden', 'Neden Biz'], ['galeri', 'Galeri'], ['yorumlar', 'Yorumlar'], ['iletisim', 'İletişim']];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'fixed',
      top: 0,
      insetInline: 0,
      zIndex: 50,
      transition: 'all var(--dur-base) var(--ease-out)',
      background: scrolled ? 'rgba(255,248,238,0.97)' : 'transparent',
      boxShadow: scrolled ? 'var(--shadow-sm)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      padding: '0 var(--gutter)',
      height: 92,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      go('top');
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-ilk-hecem-transparent.png",
    alt: "\u0130lk Hecem Anaokulu",
    style: {
      height: 72,
      width: 'auto',
      display: 'block',
      filter: 'drop-shadow(0 4px 8px rgba(39,30,107,0.12))'
    }
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    },
    className: "ih-desktop-nav"
  }, links.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: `#${id}`,
    onClick: e => {
      e.preventDefault();
      go(id);
    },
    style: {
      padding: '10px 14px',
      borderRadius: 'var(--radius-pill)',
      textDecoration: 'none',
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: '0.98rem',
      color: 'var(--text-body)',
      transition: 'background var(--dur-fast), color var(--dur-fast)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--sky-100)';
      e.currentTarget.style.color = 'var(--sky-700)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--text-body)';
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ih-desktop-nav"
  }, /*#__PURE__*/React.createElement(Button, {
    as: "a",
    href: window.WA_LINK(),
    target: "_blank",
    rel: "noopener",
    variant: "whatsapp",
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(window.WhatsApp, null)
  }, "WhatsApp'tan Bilgi Al")), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Men\xFC",
    onClick: () => setMobileOpen(!mobileOpen),
    className: "ih-mobile-toggle",
    style: {
      display: 'none',
      width: 48,
      height: 48,
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-soft)',
      background: 'var(--white)',
      color: 'var(--ink-800)',
      cursor: 'pointer',
      padding: 12,
      boxShadow: 'var(--shadow-xs)'
    }
  }, mobileOpen ? /*#__PURE__*/React.createElement(window.Close, null) : /*#__PURE__*/React.createElement(window.Menu, null)))), mobileOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px var(--gutter) 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      background: 'var(--cream-100)',
      boxShadow: 'var(--shadow-md)'
    }
  }, links.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: `#${id}`,
    onClick: e => {
      e.preventDefault();
      go(id);
      setMobileOpen(false);
    },
    style: {
      padding: '14px 16px',
      borderRadius: 'var(--radius-md)',
      textDecoration: 'none',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: '1.05rem',
      color: 'var(--text-strong)'
    }
  }, label)), /*#__PURE__*/React.createElement(Button, {
    as: "a",
    href: window.WA_LINK(),
    target: "_blank",
    rel: "noopener",
    variant: "whatsapp",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(window.WhatsApp, null),
    style: {
      marginTop: 8
    }
  }, "WhatsApp'tan Bilgi Al")));
}

/* ----------------------------------- Hero ---------------------------------- */
function Hero({
  go
}) {
  const {
    Button,
    Badge,
    StarRating
  } = DS;
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    style: {
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 110,
      paddingBottom: 'var(--section-y)',
      background: `radial-gradient(120% 80% at 12% 0%, var(--sky-50), transparent 55%),
                   radial-gradient(110% 80% at 92% 20%, var(--pink-50), transparent 55%),
                   radial-gradient(120% 90% at 50% 110%, var(--mint-50), transparent 60%),
                   var(--surface-page)`
    }
  }, /*#__PURE__*/React.createElement(window.Cloud, {
    w: 140,
    top: 96,
    dur: 80,
    delay: -12
  }), /*#__PURE__*/React.createElement(window.Cloud, {
    w: 92,
    top: 188,
    dur: 104,
    delay: -60,
    opacity: 0.78
  }), /*#__PURE__*/React.createElement(window.Cloud, {
    w: 70,
    top: 300,
    dur: 70,
    delay: -38,
    opacity: 0.62
  }), /*#__PURE__*/React.createElement(window.Balloon, {
    color: "coral-300",
    size: 44,
    top: 260,
    left: '3%',
    dur: 8
  }), /*#__PURE__*/React.createElement(window.Balloon, {
    color: "sun-300",
    size: 34,
    top: 150,
    right: '6%',
    dur: 9,
    delay: 1.2
  }), /*#__PURE__*/React.createElement(window.FloatStar, {
    color: "sun-400",
    size: 26,
    top: 120,
    left: '42%',
    dur: 6
  }), /*#__PURE__*/React.createElement(window.FloatStar, {
    color: "grape-400",
    size: 18,
    top: 300,
    right: '40%',
    dur: 7,
    delay: .8
  }), /*#__PURE__*/React.createElement(window.Dot, {
    color: "sky-400",
    size: 12,
    top: 420,
    left: '20%'
  }), /*#__PURE__*/React.createElement(window.Dot, {
    color: "pink-300",
    size: 14,
    top: 90,
    right: '30%',
    delay: .6
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: '0 auto',
      padding: '0 var(--gutter)',
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)',
      gap: 'clamp(24px,5vw,72px)',
      alignItems: 'center'
    },
    className: "ih-hero-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    color: "sun",
    size: "md",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(StarRating, {
    value: 5,
    size: 15
  })), "Google'da 5.0 \xB7 9 yorum"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--fs-hero)',
      lineHeight: 'var(--leading-tight)',
      letterSpacing: 'var(--tracking-tight)',
      color: 'var(--ink-900)',
      margin: 0
    }
  }, "\xC7ocu\u011Funuzun ilk hecesi, ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--sky-500)'
    }
  }, "mutlu"), " bir ba\u015Flang\u0131\xE7."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--leading-relaxed)',
      color: 'var(--text-body)',
      margin: '22px 0 0',
      maxWidth: 520
    }
  }, "Tuzla'da sevgi dolu, g\xFCvenli ve oyun temelli bir ortamda; miniklerimiz ke\u015Ffederek \xF6\u011Freniyor, g\xFClerek b\xFCy\xFCyor."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 14,
      marginTop: 30
    }
  }, /*#__PURE__*/React.createElement(Button, {
    as: "a",
    href: window.WA_LINK(),
    target: "_blank",
    rel: "noopener",
    variant: "whatsapp",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement(window.WhatsApp, null)
  }, "WhatsApp'tan Bilgi Al"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(window.ArrowR, null),
    onClick: () => go('hakkimizda')
  }, "Okulumuzu Tan\u0131y\u0131n")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 20,
      marginTop: 34
    }
  }, [['Shield', '2–6 yaş güvenli ortam'], ['Cap', 'Deneyimli öğretmenler'], ['Camera', 'Kameralı kampüs']].map(([ico, t]) => {
    const Ic = window[ico];
    return /*#__PURE__*/React.createElement("span", {
      key: t,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        color: 'var(--text-body)',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: '0.95rem'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        color: 'var(--mint-500)'
      }
    }, /*#__PURE__*/React.createElement(Ic, null)), t);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      minHeight: 460
    },
    className: "ih-hero-art"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 'var(--radius-2xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xl)',
      transform: 'rotate(-2deg)'
    }
  }, /*#__PURE__*/React.createElement(window.Photo, {
    src: "../../assets/photo-mutlu-cocuklar.webp",
    label: "Mutlu \xE7ocuklar at\xF6lyede",
    focus: "center 35%",
    radius: "0"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      width: 168,
      height: 168,
      right: -8,
      bottom: 24,
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
      border: '5px solid var(--white)',
      transform: 'rotate(4deg)'
    }
  }, /*#__PURE__*/React.createElement(window.Photo, {
    src: "../../assets/photo-atolye.webp",
    label: "At\xF6lye \xE7al\u0131\u015Fmas\u0131",
    focus: "center 30%",
    radius: "0"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: -26,
      top: 40,
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 18px',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      animation: 'ih-float 6s ease-in-out infinite'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-md)',
      background: 'var(--mint-100)',
      color: 'var(--mint-600)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 26,
      height: 26
    }
  }, /*#__PURE__*/React.createElement(window.Smile, null))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 18,
      color: 'var(--ink-900)'
    }
  }, "120+"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "mutlu minik"))), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-ilk-hecem-transparent.png",
    alt: "",
    style: {
      position: 'absolute',
      width: 120,
      right: -18,
      top: -28,
      filter: 'drop-shadow(0 8px 16px rgba(39,30,107,0.18))',
      animation: 'ih-bob 7s ease-in-out infinite'
    }
  }))));
}

/* ---------------------------------- About ---------------------------------- */
function About({}) {
  const {
    Card
  } = DS;
  const stats = [['Sun', 'sun', '9', 'yıllık deneyim'], ['Users', 'sky', '8', 'branş dersi'], ['Heart', 'pink', '1:6', 'öğretmen oranı'], ['StarLn', 'mint', '5.0', 'veli memnuniyeti']];
  return /*#__PURE__*/React.createElement(window.Section, {
    id: "hakkimizda"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
      gap: 'clamp(32px,5vw,72px)',
      alignItems: 'center'
    },
    className: "ih-2col"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: '4/5',
      borderRadius: 'var(--radius-2xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)'
    }
  }, /*#__PURE__*/React.createElement(window.Photo, {
    src: "../../assets/photo-sinif-ani.webp",
    label: "S\u0131n\u0131f\u0131m\u0131zdan bir an",
    focus: "center 42%",
    radius: "0"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -16,
      bottom: -16,
      background: 'var(--white)',
      borderRadius: 'var(--radius-xl)',
      padding: '18px 22px',
      boxShadow: 'var(--shadow-lg)',
      maxWidth: 220
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: 'var(--coral-500)',
      fontSize: 30,
      lineHeight: 1
    }
  }, "\u201C"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      color: 'var(--text-body)',
      fontSize: 15,
      lineHeight: 1.5
    }
  }, "Her \xE7ocuk biriciktir; biz de her birini \xF6yle b\xFCy\xFCt\xFCr\xFCz."))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.SectionHead, {
    align: "left",
    eyebrow: "Hakk\u0131m\u0131zda",
    eyebrowColor: "coral",
    title: "Sevginin ve ke\u015Ffin bulu\u015Ftu\u011Fu s\u0131cac\u0131k bir yuva",
    lead: "\xD6zel Tuzla \u0130lk Hecem Anaokulu'nda \xE7ocuklar kendini g\xFCvende, mutlu ve de\u011Ferli hisseder. Oyun temelli e\u011Fitim anlay\u0131\u015F\u0131m\u0131zla akademik, sosyal ve duygusal geli\u015Fimi birlikte destekleriz."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
      marginTop: 30
    }
  }, stats.map(([ico, tint, num, label]) => {
    const Ic = window[ico];
    return /*#__PURE__*/React.createElement(Card, {
      key: label,
      padding: "18px",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 46,
        height: 46,
        flexShrink: 0,
        borderRadius: 'var(--radius-md)',
        background: `var(--${tint}-100)`,
        color: `var(--${tint}-600)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24
      }
    }, /*#__PURE__*/React.createElement(Ic, null))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 22,
        color: 'var(--ink-900)',
        lineHeight: 1
      }
    }, num), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13.5,
        color: 'var(--text-muted)'
      }
    }, label)));
  })))));
}

/* ------------------------------- Philosophy -------------------------------- */
function Philosophy({}) {
  const items = [['Smile', 'sky', 'Oyunla Öğrenme', 'Çocuklar en iyi oynayarak öğrenir. Her etkinlik bir keşif macerasıdır.'], ['Heart', 'pink', 'Sevgi Dolu Ortam', 'Güven veren, sıcak ve kucaklayan bir atmosferde büyürler.'], ['Sparkle', 'sun', 'Bireysel Gelişim', 'Her çocuğun temposuna saygı duyar, güçlü yönlerini parlatırız.'], ['Leaf', 'mint', 'Doğayla İç İçe', 'Doğa etkinlikleriyle merakı ve sorumluluk duygusunu besleriz.']];
  return /*#__PURE__*/React.createElement(window.Section, {
    id: "anlayis",
    bg: "linear-gradient(180deg, var(--sky-50), var(--surface-page))",
    decor: /*#__PURE__*/React.createElement(window.CloudField, {
      density: 3
    })
  }, /*#__PURE__*/React.createElement(window.SectionHead, {
    eyebrow: "E\u011Fitim Anlay\u0131\u015F\u0131m\u0131z",
    eyebrowColor: "sky",
    title: "Ke\u015Ffederek \xF6\u011Frenmenin d\xF6rt temeli",
    lead: "Modern, \xE7ocuk merkezli ve geli\u015Fimsel bir yakla\u015F\u0131mla minikleri gelece\u011Fe haz\u0131rl\u0131yoruz."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 20,
      marginTop: 48
    },
    className: "ih-grid-4"
  }, items.map(([ico, tint, title, desc], i) => {
    const Ic = window[ico];
    return /*#__PURE__*/React.createElement("div", {
      key: title,
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 84,
        height: 84,
        margin: '0 auto',
        borderRadius: 'var(--radius-blob)',
        background: `var(--${tint}-100)`,
        color: `var(--${tint}-600)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-sm)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        height: 40
      }
    }, /*#__PURE__*/React.createElement(Ic, null))), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 'var(--fs-h3)',
        color: 'var(--text-strong)',
        margin: '18px 0 8px'
      }
    }, title), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: '1rem',
        lineHeight: 1.55,
        color: 'var(--text-muted)',
        margin: 0
      }
    }, desc));
  })));
}

/* -------------------------------- Programs --------------------------------- */
function Programs({}) {
  const {
    ProgramCard
  } = DS;
  const progs = [['Globe', 'sky', 'İngilizce', 'Oyun ve şarkılarla doğal, eğlenceli dil edinimi.'], ['Flask', 'coral', 'Fen & Doğa', 'Deneyler ve gözlemle meraklı küçük bilim insanları.'], ['Music', 'mint', 'Müzik & Ritim', 'Ritim, melodi ve hareketle özgür ifade.'], ['Drama', 'sun', 'Drama', 'Rol yaparak özgüven, empati ve iletişim.'], ['Chess', 'grape', 'Satranç', 'Strateji, sabır ve dikkatle düşünme becerisi.'], ['Values', 'pink', 'Değerler Eğitimi', 'Sevgi, paylaşma ve saygıyı günlük yaşama taşıma.'], ['Palette', 'coral', 'Atölye Çalışmaları', 'Sanat ve el becerileriyle yaratıcılığı besleme.'], ['Robot', 'sky', 'Robotik & Kodlama', 'Yaşına uygun robotik ile algoritmik düşünme.']];
  return /*#__PURE__*/React.createElement(window.Section, {
    id: "branslar"
  }, /*#__PURE__*/React.createElement(window.SectionHead, {
    eyebrow: "Bran\u015F Dersleri",
    eyebrowColor: "grape",
    title: "Her g\xFCn yeni bir yetene\u011Fi ke\u015Ffediyoruz",
    lead: "Sekiz farkl\u0131 bran\u015F dersiyle \xE7ocuklar\u0131n \xE7ok y\xF6nl\xFC geli\u015Fimini destekliyoruz."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 20,
      marginTop: 48
    },
    className: "ih-grid-4"
  }, progs.map(([ico, accent, title, desc]) => {
    const Ic = window[ico];
    return /*#__PURE__*/React.createElement(ProgramCard, {
      key: title,
      accent: accent,
      icon: /*#__PURE__*/React.createElement(Ic, null),
      title: title,
      description: desc
    });
  })));
}
Object.assign(window, {
  SiteHeader,
  Hero,
  About,
  Philosophy,
  Programs
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/SectionsTop.js", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.StarRating = __ds_scope.StarRating;

__ds_ns.FeatureCard = __ds_scope.FeatureCard;

__ds_ns.ProgramCard = __ds_scope.ProgramCard;

__ds_ns.TestimonialCard = __ds_scope.TestimonialCard;

})();
