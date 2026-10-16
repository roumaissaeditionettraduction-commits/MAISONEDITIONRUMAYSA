import { StorageService } from './storage';

export const PixelService = {
  trackPageView: (pageName: string) => {
    const settings = StorageService.getPixelSettings();
    if (!settings.isEnabled) return;

    StorageService.logPixelEvent({
      platform: 'facebook',
      eventName: 'PageView',
      parameters: { page: pageName, url: window.location.href }
    });

    StorageService.logPixelEvent({
      platform: 'tiktok',
      eventName: 'Pageview',
      parameters: { page: pageName }
    });
  },

  trackViewContent: (bookTitle: string, price: number, format: string) => {
    const settings = StorageService.getPixelSettings();
    if (!settings.isEnabled) return;

    StorageService.logPixelEvent({
      platform: 'facebook',
      eventName: 'ViewContent',
      parameters: {
        content_name: bookTitle,
        content_type: 'product',
        value: price,
        currency: 'DZD',
        format
      }
    });

    StorageService.logPixelEvent({
      platform: 'tiktok',
      eventName: 'ViewContent',
      parameters: {
        content_name: bookTitle,
        value: price,
        currency: 'DZD'
      }
    });
  },

  trackAddToCart: (bookTitle: string, price: number, quantity: number, format: string) => {
    const settings = StorageService.getPixelSettings();
    if (!settings.isEnabled) return;

    StorageService.logPixelEvent({
      platform: 'facebook',
      eventName: 'AddToCart',
      parameters: {
        content_name: bookTitle,
        value: price * quantity,
        currency: 'DZD',
        quantity,
        format
      }
    });

    StorageService.logPixelEvent({
      platform: 'tiktok',
      eventName: 'AddToCart',
      parameters: {
        content_name: bookTitle,
        value: price * quantity,
        currency: 'DZD'
      }
    });
  },

  trackInitiateCheckout: (total: number, itemsCount: number) => {
    const settings = StorageService.getPixelSettings();
    if (!settings.isEnabled) return;

    StorageService.logPixelEvent({
      platform: 'facebook',
      eventName: 'InitiateCheckout',
      parameters: {
        value: total,
        currency: 'DZD',
        num_items: itemsCount
      }
    });

    StorageService.logPixelEvent({
      platform: 'tiktok',
      eventName: 'InitiateCheckout',
      parameters: {
        value: total,
        currency: 'DZD'
      }
    });
  },

  trackPurchase: (orderNumber: string, total: number, paymentMethod: string, itemsCount: number) => {
    const settings = StorageService.getPixelSettings();
    if (!settings.isEnabled) return;

    StorageService.logPixelEvent({
      platform: 'facebook',
      eventName: 'Purchase',
      parameters: {
        value: total,
        currency: 'DZD',
        order_id: orderNumber,
        payment_method: paymentMethod,
        num_items: itemsCount
      }
    });

    StorageService.logPixelEvent({
      platform: 'tiktok',
      eventName: 'CompletePayment',
      parameters: {
        value: total,
        currency: 'DZD',
        order_id: orderNumber
      }
    });
  }
};
