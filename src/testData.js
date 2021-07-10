const orders = [
    {
        id: 1,
        customer: {
            id: 1,
            name: "Davin Young",
            phone: "239-770-1730",
            address: {
                city: "Cape Coral",
                line1: "821 sw 48th ter",
                postal: 33914,
                state: "fl"
            },
            cards: [
                "card_1123234"
            ],
            orders: [],
            notes: "Allergic to tomatoes."
        },
        meals: [
            {
                id: 1,
                protein: "Turkey",
                veggie: "Broccoli",
                carb: "Bread Roll",
                sauce: "BBQ",
                deliveryDate: Date,
                dateTimeMade: Date,
                status: String,
                parentOrder: Order,
                priceID: String,
            }
        ],
        status: "Made",
        total: 45.44,
        coupon: "",
        notes: "This guy is cool, give him free food!"
    }
];