'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        await queryInterface.bulkInsert('Products', [
            {
                name: 'iPhone 15 128GB',
                price: 20990000,
                description: 'Smartphone cao cap, camera tot va hieu nang on dinh.',
                image: 'https://picsum.photos/seed/iphone15/900/600',
                stock: 12,
                categoryId: 1,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Samsung Galaxy S24',
                price: 18990000,
                description: 'Dien thoai Android manh, man hinh dep va thiet ke gon.',
                image: 'https://picsum.photos/seed/galaxys24/900/600',
                stock: 10,
                categoryId: 1,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'MacBook Air M3',
                price: 28990000,
                description: 'Laptop mong nhe cho hoc tap, van phong va lap trinh.',
                image: 'https://picsum.photos/seed/macbookairm3/900/600',
                stock: 8,
                categoryId: 2,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'ASUS TUF Gaming A15',
                price: 24990000,
                description: 'Laptop gaming tam trung voi card roi va tan nhiet tot.',
                image: 'https://picsum.photos/seed/asustufa15/900/600',
                stock: 6,
                categoryId: 2,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'AirPods Pro 2',
                price: 5990000,
                description: 'Tai nghe khong day chong on, gon nhe va de su dung.',
                image: 'https://picsum.photos/seed/airpodspro2/900/600',
                stock: 20,
                categoryId: 3,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Sony WH-1000XM5',
                price: 7990000,
                description: 'Tai nghe over-ear chong on cao cap cho cong viec va giai tri.',
                image: 'https://picsum.photos/seed/sonyxm5/900/600',
                stock: 9,
                categoryId: 3,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Ban phim co RGB',
                price: 1290000,
                description: 'Ban phim co layout fullsize, switch linear, den RGB.',
                image: 'https://picsum.photos/seed/keyboardrgb/900/600',
                stock: 15,
                categoryId: 4,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Chuot khong day Silent',
                price: 490000,
                description: 'Chuot van phong khong day, ket noi on dinh va pin tot.',
                image: 'https://picsum.photos/seed/mousesilent/900/600',
                stock: 30,
                categoryId: 4,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Tay cam choi game Pro',
                price: 1590000,
                description: 'Tay cam gaming rung phan hoi tot, ho tro da nen tang.',
                image: 'https://picsum.photos/seed/controllerpro/900/600',
                stock: 11,
                categoryId: 5,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Ghe gaming cong thai hoc',
                price: 3590000,
                description: 'Ghe gaming tua lung cao, phu hop ngoi lau.',
                image: 'https://picsum.photos/seed/gamingchair/900/600',
                stock: 5,
                categoryId: 5,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Man hinh 27 inch 2K',
                price: 4990000,
                description: 'Man hinh do phan giai 2K, phu hop lam viec va giai tri.',
                image: 'https://picsum.photos/seed/monitor2k27/900/600',
                stock: 7,
                categoryId: 6,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Man hinh gaming 165Hz',
                price: 5890000,
                description: 'Man hinh tan so quet cao cho game thu va streamer.',
                image: 'https://picsum.photos/seed/monitor165hz/900/600',
                stock: 6,
                categoryId: 6,
                sellerId: 2,
                createdAt: now,
                updatedAt: now
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Products', null, {});
    }
};
