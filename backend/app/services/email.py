from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from typing import List, Dict, Any
from datetime import datetime
import tempfile
import os
from pathlib import Path
from ..core.config import settings
from .invoice import generate_invoice_pdf


def get_mail_config() -> ConnectionConfig:
    return ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=bool(settings.MAIL_USERNAME),
        VALIDATE_CERTS=True,
    )


async def send_order_confirmation(
    email: str,
    user_name: str,
    order_id: int,
    items: List[Dict[str, Any]],
    total_amount: float,
    shipping_address: str,
    payment_method: str = "Online Payment",
    order_date: datetime | None = None,
):
    """Send order confirmation email with a PDF invoice attached."""
    try:
        items_html = "".join([
            f"""
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">{item['name']}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align:center;">{item['quantity']}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align:right;">₹{item['price']:,.0f}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align:right;">₹{item['price'] * item['quantity']:,.0f}</td>
            </tr>
            """
            for item in items
        ])

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: #2874f0; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Flipkart</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Order Confirmation</p>
            </div>

            <!-- Body -->
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #333;">Hi <strong>{user_name}</strong>,</p>
              <p style="color: #555;">Thank you for your order! We're excited to let you know that your order has been confirmed.</p>

              <div style="background: #f0f4ff; border-left: 4px solid #2874f0; padding: 16px; border-radius: 4px; margin: 20px 0;">
                <strong style="color: #2874f0;">Order ID: #{order_id}</strong>
              </div>

              <!-- Items Table -->
              <h3 style="color: #333; margin-top: 24px;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 10px 8px; text-align: left; color: #666;">Product</th>
                    <th style="padding: 10px 8px; text-align: center; color: #666;">Qty</th>
                    <th style="padding: 10px 8px; text-align: right; color: #666;">Price</th>
                    <th style="padding: 10px 8px; text-align: right; color: #666;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items_html}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 16px;">Grand Total:</td>
                    <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 16px; color: #2874f0;">₹{total_amount:,.0f}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Shipping -->
              <div style="margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
                <h4 style="margin: 0 0 8px; color: #333;">📦 Shipping Address</h4>
                <p style="margin: 0; color: #555; line-height: 1.6;">{shipping_address}</p>
              </div>

              <!-- Invoice note -->
              <div style="margin-top: 16px; padding: 12px 16px; background: #fff8e1; border-radius: 8px; border-left: 4px solid #f0c14b;">
                <p style="margin: 0; color: #555; font-size: 13px;">📄 <strong>Invoice attached:</strong> Please find your detailed invoice PDF attached to this email.</p>
              </div>

              <p style="color: #555; margin-top: 24px;">
                Your order will be delivered within <strong>3-7 business days</strong>.
                You can track your order in the <a href="{settings.FRONTEND_URL}/orders" style="color: #2874f0;">Order History</a> section.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
              <p style="margin: 0;">© Flipkart. All rights reserved.</p>
              <p style="margin: 4px 0 0;">This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
        """

        config = get_mail_config()
        if not config.MAIL_USERNAME:
            print(f"Email not configured – Order #{order_id} confirmed for {email}")
            return

        # ── Generate PDF invoice ────────────────────────────────────────────────
        pdf_bytes = generate_invoice_pdf(
            order_id=order_id,
            user_name=user_name,
            user_email=email,
            shipping_address=shipping_address,
            payment_method=payment_method,
            items=items,
            total_amount=total_amount,
            order_date=order_date,
        )

        # Write to a temp file — fastapi-mail requires a path, not raw bytes
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(
                delete=False, suffix=".pdf", prefix=f"flipkart_invoice_{order_id}_"
            ) as tmp:
                tmp.write(pdf_bytes)
                tmp_path = Path(tmp.name)

            message = MessageSchema(
                subject=f"Order Confirmed! ✅ Order #{order_id} - Flipkart",
                recipients=[email],
                body=html_body,
                subtype=MessageType.html,
                attachments=[str(tmp_path)],
            )

            fm = FastMail(config)
            await fm.send_message(message)
            print(f"Order confirmation + invoice sent to {email}")

        finally:
            # Clean up temp file after sending (or on error)
            if tmp_path and tmp_path.exists():
                os.unlink(tmp_path)

    except Exception as e:
        # Don't fail the order if the email fails
        print(f"Email sending failed (non-critical): {e}")
