
<template>
     <div id="mapContainer"></div>
</template>
<script setup lang="ts">
import AMapLoader from '@amap/amap-jsapi-loader';
import { shallowRef, onMounted, ref } from 'vue';
import { GetFoodMapList } from './config'
const map = ref(null);
const currentPosition = ref({});
onMounted(() => {
  window._AMapSecurityConfig = {
    securityJsCode: 'b93f8466e3cbf4b982065dc394eff857'
  };
  initMap();
});
const initMap = ()=>{
  AMapLoader.load({ 
    key: '1ab83a26a29e05812d5fb5e347fb279a',
    version: '2.0',  // 推荐 2.0 版本 
    plugins: ['AMap.Scale', 'AMap.ToolBar','AMap.Geolocation','AMap.Marker'],
    Loca:{
      version:"2.0.0"
    }
  }).then((AMap) => {
    map.value  = new AMap.Map('mapContainer', {
      zoom: 11,
      center: [118.608045,32.055255],
      viewMode: '3D',
      resizeEnable: true // 自适应窗口 
    });
      // 初始化定位插件 
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true, // 高精度定位 
      timeout: 10000, // 超时时间 
      buttonPosition: 'RB' // 定位按钮位置（右下）
    });
 
    map.value.addControl(geolocation); 
    // 定位成功回调 
    geolocation.getCurrentPosition((status,  result) => {
      if (status === 'complete') {
        currentPosition.value  = {
          lng: result.position.lng, 
          lat: result.position.lat, 
          address: result.formattedAddress  
        };
        map.value.setCenter([result.position.lng,  result.position.lat]);  // 地图中心点定位 
      } else {
        console.error(' 定位失败:', result);
        

        if (status !== 'complete') {
          AMap.plugin('AMap.CitySearch',  () => {
            const citySearch = new AMap.CitySearch();
              citySearch.getLocalCity((status,  result) => {
                if (status === 'complete') {
                  map.value.setCenter(result.cityinfo.center); 
                }
              });
            });
          }

      }
    });
    
    // const marker = new AMap.Marker({
    //   position: [113.664206, 34.737714],
    //   icon: new AMap.Icon({
    //   size: new AMap.Size(40, 50),
    //   image: './assets/location.png' 
    //   })
    // });
    // map.value.add(marker); 

    // 批量添加标记（需遍历坐标数组）
    const { foodMapList }  = GetFoodMapList();
    const markers = foodMapList.map(food  => 
    new AMap.Marker({
        title:food.name,
        position: food.position,
        icon: new AMap.Icon({
          size: new AMap.Size(50, 25 ), // 图标大小
          image: food.iconUrl,
          imageSize: new AMap.Size(20, 25), // 图标显示大小
        }),
        offset: new AMap.Pixel(-30,-15)
        
        })
    );
    map.value.add(markers); 
    map.value.setFitView();  // 自适
  }).catch(e => console.error(e)); 
}
</script>
<style scoped>

#mapContainer{
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;

}
</style>
