const icon = {
    // 图标类型，现阶段只支持 image 类型
    type: 'image',
    // 图片 url
    image:
        '/public/icons/location.png',
    // 图片尺寸
    size: [30, 30],
    // 图片相对 position 的锚点，默认为 bottom-center
    anchor: 'center',
};
const textStyle = {
    fontSize: 12,
    fontWeight: 'normal',
    fillColor: '#22886f',
    strokeColor: '#fff',
    strokeWidth: 2,
    fold: true,
    padding: '2, 5',
};
export const GetFoodMapList = () => {
    // const foodMapList = [
    //     {
    //         name: '美味披萨店',
    //         position: [118.608045, 32.06],
    //         zooms: [10, 20],
    //         opacity: 1,
    //         zIndex: 16,
    //         icon,
    //         text: {
    //             content: '美味披萨店',
    //             direction: 'right',
    //             offset: [-20, -5],
    //             style: textStyle,
    //         },
    //     },
    //     {
    //         name: '美味馒头店',
    //         position: [118.609, 32.06],
    //         zooms: [10, 20],
    //         opacity: 1,
    //         zIndex: 16,
    //         icon,
    //         text: {
    //             content: '美味馒头店',
    //             direction: 'right',
    //             offset: [-20, -5],
    //             style: textStyle,
    //         },
    //     },
    //     {
    //         name: '美味汉堡店',
    //         position: [118.608045, 32.07],
    //         zooms: [10, 20],
    //         opacity: 1,
    //         zIndex: 16,
    //         icon,
    //         text: {
    //             content: '美味汉堡店',
    //             direction: 'right',
    //             offset: [-20, -5],
    //             style: textStyle,
    //         },
    //     },

    // ]
    const foodMapList = [
        {
            lnglat: [118.608045, 32.055255],
            district: "秦淮区",//县/区
            community: "美味披萨店",//公寓
            building: "新心社区",//社区
            area: "",//街道（小区域）
            city: "南京"
        }
    ];
    return {
        foodMapList
    }
}
