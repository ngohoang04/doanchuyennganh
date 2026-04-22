import React from 'react';
import './footer.css';

function Footer() {
    return (
        <div className="footer mt-5">
            <div className="container py-5">
                <div className="row">
                    <div className="col-md-3">
                        <h5>TechShop</h5>
                        <p>Chuyên cung cấp sản phẩm công nghệ chính hãng với mức giá cạnh tranh.</p>
                    </div>

                    <div className="col-md-3">
                        <h6><b>Liên kết</b></h6>
                        <p>Trang chủ</p>
                        <p>Sản phẩm</p>
                        <p>Giỏ hàng</p>
                    </div>

                    <div className="col-md-3">
                        <h6><b>Hỗ trợ</b></h6>
                        <p>Liên hệ</p>
                        <p>Chính sách</p>
                        <p>Bảo hành</p>
                    </div>

                    <div className="col-md-3">
                        <h6><b>Liên hệ</b></h6>
                        <p>Email: techshop@gmail.com</p>
                        <p>Hotline: 0123 456 789</p>
                    </div>
                </div>
            </div>

            <div className="footer-bottom text-center py-3">
                © 2026 TechShop. All rights reserved.
            </div>
        </div>
    );
}

export default Footer;
