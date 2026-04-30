import type { LanguageCode } from '@/api/types';

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  ps: 'پښتو',
  'zh-CN': '简体中文',
};

export const RTL_LANGUAGES: ReadonlySet<LanguageCode> = new Set(['ps']);

export type TranslationKey =
  | 'app.title'
  | 'topbar.search.placeholder'
  | 'topbar.cart'
  | 'topbar.cart.empty'
  | 'topbar.language'
  | 'topbar.currency'
  | 'filters.allCategories'
  | 'product.addToCart'
  | 'product.outOfStock'
  | 'product.stock'
  | 'product.inCart'
  | 'cart.title'
  | 'cart.empty'
  | 'cart.subtotal'
  | 'cart.checkout'
  | 'cart.continueShopping'
  | 'cart.remove'
  | 'cart.quantity'
  | 'cart.maxStock'
  | 'checkout.title'
  | 'checkout.back'
  | 'checkout.customer'
  | 'checkout.name'
  | 'checkout.phone'
  | 'checkout.telegram'
  | 'checkout.telegramHint'
  | 'checkout.comment'
  | 'checkout.delivery'
  | 'checkout.deliveryFee'
  | 'checkout.summary'
  | 'checkout.subtotal'
  | 'checkout.total'
  | 'checkout.placeOrder'
  | 'checkout.placing'
  | 'checkout.quoting'
  | 'checkout.requireDelivery'
  | 'checkout.requireItems'
  | 'success.title'
  | 'success.orderNumber'
  | 'success.total'
  | 'success.note'
  | 'success.continue'
  | 'common.loading'
  | 'common.retry'
  | 'common.close'
  | 'common.error'
  | 'common.empty'
  | 'common.noProducts'
  | 'common.noImage';

type Dict = Record<TranslationKey, string>;

const en: Dict = {
  'app.title': 'Shop Meraj',
  'topbar.search.placeholder': 'Search products',
  'topbar.cart': 'Cart',
  'topbar.cart.empty': 'Cart is empty',
  'topbar.language': 'Language',
  'topbar.currency': 'Currency',
  'filters.allCategories': 'All categories',
  'product.addToCart': 'Add to cart',
  'product.outOfStock': 'Out of stock',
  'product.stock': 'In stock: {count}',
  'product.inCart': 'In cart: {count}',
  'cart.title': 'Your cart',
  'cart.empty': 'Your cart is empty.',
  'cart.subtotal': 'Subtotal',
  'cart.checkout': 'Checkout',
  'cart.continueShopping': 'Continue shopping',
  'cart.remove': 'Remove',
  'cart.quantity': 'Quantity',
  'cart.maxStock': 'Only {count} left',
  'checkout.title': 'Checkout',
  'checkout.back': 'Back to cart',
  'checkout.customer': 'Customer details',
  'checkout.name': 'Full name',
  'checkout.phone': 'Phone',
  'checkout.telegram': 'Telegram',
  'checkout.telegramHint': 'Optional, e.g. @username',
  'checkout.comment': 'Order notes',
  'checkout.delivery': 'Delivery address',
  'checkout.deliveryFee': 'Delivery fee',
  'checkout.summary': 'Order summary',
  'checkout.subtotal': 'Subtotal',
  'checkout.total': 'Total',
  'checkout.placeOrder': 'Place order',
  'checkout.placing': 'Placing order…',
  'checkout.quoting': 'Calculating total…',
  'checkout.requireDelivery': 'Choose a delivery address.',
  'checkout.requireItems': 'Cart is empty.',
  'success.title': 'Order placed',
  'success.orderNumber': 'Order number',
  'success.total': 'Total',
  'success.note': 'We will contact you shortly to confirm the delivery.',
  'success.continue': 'Back to shop',
  'common.loading': 'Loading…',
  'common.retry': 'Retry',
  'common.close': 'Close',
  'common.error': 'Something went wrong',
  'common.empty': 'Nothing here yet',
  'common.noProducts': 'No products match your search',
  'common.noImage': 'No image',
};

const ps: Dict = {
  'app.title': 'د مېراج پلورنځی',
  'topbar.search.placeholder': 'د توکو لټون',
  'topbar.cart': 'سبد',
  'topbar.cart.empty': 'سبد خالي دی',
  'topbar.language': 'ژبه',
  'topbar.currency': 'اسعار',
  'filters.allCategories': 'ټولې کټګورۍ',
  'product.addToCart': 'سبد ته اضافه کړئ',
  'product.outOfStock': 'پای ته رسېدلی',
  'product.stock': 'موجود: {count}',
  'product.inCart': 'په سبد کې: {count}',
  'cart.title': 'ستاسو سبد',
  'cart.empty': 'ستاسو سبد خالي دی.',
  'cart.subtotal': 'فرعي ټوله',
  'cart.checkout': 'پای ته رسول',
  'cart.continueShopping': 'پیرودنه دوام ورکړئ',
  'cart.remove': 'لرې کول',
  'cart.quantity': 'مقدار',
  'cart.maxStock': 'یوازې {count} پاتې دي',
  'checkout.title': 'د سپارښتنې پای ته رسول',
  'checkout.back': 'سبد ته بېرته',
  'checkout.customer': 'د پیرودونکي معلومات',
  'checkout.name': 'بشپړ نوم',
  'checkout.phone': 'تلیفون',
  'checkout.telegram': 'ټلګرام',
  'checkout.telegramHint': 'اختیاري، د بېلګې په توګه @username',
  'checkout.comment': 'د سپارښتنې یاداښتونه',
  'checkout.delivery': 'د لېږد پته',
  'checkout.deliveryFee': 'د لېږد لګښت',
  'checkout.summary': 'د سپارښتنې لنډیز',
  'checkout.subtotal': 'فرعي ټوله',
  'checkout.total': 'ټوله',
  'checkout.placeOrder': 'سپارښتنه ثبت کړئ',
  'checkout.placing': 'سپارښتنه ثبتېږي…',
  'checkout.quoting': 'مجموعه محاسبه کېږي…',
  'checkout.requireDelivery': 'مهرباني وکړئ د لېږد پته وټاکئ.',
  'checkout.requireItems': 'سبد خالي دی.',
  'success.title': 'سپارښتنه ثبت شوه',
  'success.orderNumber': 'د سپارښتنې شمېره',
  'success.total': 'ټوله',
  'success.note': 'موږ به ډېر ژر د تایید لپاره ستاسو سره اړیکه ونیسو.',
  'success.continue': 'پلورنځي ته بېرته',
  'common.loading': 'بارېږي…',
  'common.retry': 'بیا هڅه وکړئ',
  'common.close': 'بندول',
  'common.error': 'یوه ستونزه رامنځته شوه',
  'common.empty': 'دلته څه نشته',
  'common.noProducts': 'د لټون پایلې ونه موندل شوې',
  'common.noImage': 'انځور نشته',
};

const zhCN: Dict = {
  'app.title': '梅拉吉商店',
  'topbar.search.placeholder': '搜索商品',
  'topbar.cart': '购物车',
  'topbar.cart.empty': '购物车为空',
  'topbar.language': '语言',
  'topbar.currency': '货币',
  'filters.allCategories': '全部分类',
  'product.addToCart': '加入购物车',
  'product.outOfStock': '缺货',
  'product.stock': '库存：{count}',
  'product.inCart': '已选：{count}',
  'cart.title': '您的购物车',
  'cart.empty': '购物车为空。',
  'cart.subtotal': '小计',
  'cart.checkout': '结算',
  'cart.continueShopping': '继续购物',
  'cart.remove': '移除',
  'cart.quantity': '数量',
  'cart.maxStock': '仅剩 {count} 件',
  'checkout.title': '结算',
  'checkout.back': '返回购物车',
  'checkout.customer': '客户信息',
  'checkout.name': '姓名',
  'checkout.phone': '电话',
  'checkout.telegram': 'Telegram',
  'checkout.telegramHint': '可选，例如 @username',
  'checkout.comment': '订单备注',
  'checkout.delivery': '配送地址',
  'checkout.deliveryFee': '配送费',
  'checkout.summary': '订单摘要',
  'checkout.subtotal': '小计',
  'checkout.total': '合计',
  'checkout.placeOrder': '提交订单',
  'checkout.placing': '正在提交…',
  'checkout.quoting': '正在计算总价…',
  'checkout.requireDelivery': '请选择配送地址。',
  'checkout.requireItems': '购物车为空。',
  'success.title': '订单已提交',
  'success.orderNumber': '订单号',
  'success.total': '合计',
  'success.note': '我们会尽快与您联系确认配送。',
  'success.continue': '返回商店',
  'common.loading': '加载中…',
  'common.retry': '重试',
  'common.close': '关闭',
  'common.error': '出错了',
  'common.empty': '这里还没有内容',
  'common.noProducts': '没有匹配的商品',
  'common.noImage': '暂无图片',
};

export const DICT: Record<LanguageCode, Dict> = {
  en,
  ps,
  'zh-CN': zhCN,
};

export function translate(
  language: LanguageCode,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const template = DICT[language]?.[key] ?? DICT.en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const value = vars[name];
    return value == null ? '' : String(value);
  });
}
