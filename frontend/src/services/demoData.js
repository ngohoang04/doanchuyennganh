export const demoCategories = [
    { id: 1, name: 'Điện thoại', image: 'https://picsum.photos/seed/category-phone/600/420' },
    { id: 2, name: 'Laptop', image: 'https://picsum.photos/seed/category-laptop/600/420' },
    { id: 3, name: 'Tai nghe', image: 'https://picsum.photos/seed/category-headphone/600/420' },
    { id: 4, name: 'Phụ kiện', image: 'https://picsum.photos/seed/category-accessory/600/420' },
    { id: 5, name: 'Gaming', image: 'https://picsum.photos/seed/category-gaming/600/420' },
    { id: 6, name: 'Màn hình', image: 'https://picsum.photos/seed/category-monitor/600/420' }
];

export const demoProducts = [
    {
        id: 1,
        name: 'iPhone 15 128GB',
        price: 20990000,
        description: 'Smartphone cao cấp, camera tốt và hiệu năng ổn định.',
        image: 'https://picsum.photos/seed/iphone15/900/600',
        stock: 12,
        categoryId: 1,
        category: { id: 1, name: 'Điện thoại' }
    },
    {
        id: 2,
        name: 'Samsung Galaxy S24',
        price: 18990000,
        description: 'Điện thoại Android mạnh, màn hình đẹp và thiết kế gọn.',
        image: 'https://picsum.photos/seed/galaxys24/900/600',
        stock: 10,
        categoryId: 1,
        category: { id: 1, name: 'Điện thoại' }
    },
    {
        id: 3,
        name: 'MacBook Air M3',
        price: 28990000,
        description: 'Laptop mỏng nhẹ cho học tập, văn phòng và lập trình.',
        image: 'https://picsum.photos/seed/macbookairm3/900/600',
        stock: 8,
        categoryId: 2,
        category: { id: 2, name: 'Laptop' }
    },
    {
        id: 4,
        name: 'ASUS TUF Gaming A15',
        price: 24990000,
        description: 'Laptop gaming tầm trung với card rời và tản nhiệt tốt.',
        image: 'https://picsum.photos/seed/asustufa15/900/600',
        stock: 6,
        categoryId: 2,
        category: { id: 2, name: 'Laptop' }
    },
    {
        id: 5,
        name: 'AirPods Pro 2',
        price: 5990000,
        description: 'Tai nghe không dây chống ồn, gọn nhẹ và dễ sử dụng.',
        image: 'https://picsum.photos/seed/airpodspro2/900/600',
        stock: 20,
        categoryId: 3,
        category: { id: 3, name: 'Tai nghe' }
    },
    {
        id: 6,
        name: 'Sony WH-1000XM5',
        price: 7990000,
        description: 'Tai nghe over-ear chống ồn cao cấp cho công việc và giải trí.',
        image: 'https://picsum.photos/seed/sonyxm5/900/600',
        stock: 9,
        categoryId: 3,
        category: { id: 3, name: 'Tai nghe' }
    }
];
