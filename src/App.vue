
<template>
     <div id="mapContainer" style="width: 100%; height: 600px"></div>
</template>
<script setup lang="ts">
import AMapLoader from '@amap/amap-jsapi-loader';
import { shallowRef, onMounted } from 'vue';
const map = shallowRef(null);
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
    plugins: ['AMap.Scale', 'AMap.ToolBar'],
    Loca:{
      version:"2.0.0"
    }
  }).then((AMap) => {
    map.value  = new AMap.Map('mapContainer', {
      zoom: 11,
      center: [113.664206, 34.737714],
      viewMode: '3D'
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
    // const markers = devices.map(device  => 
    // new AMap.Marker({ position: [device.lng, device.lat]  })
    // );
    // map.value.add(markers); 
    // map.value.setFitView();  // 自适
  }).catch(e => console.error(e)); 
}
</script>
<style scoped>

#mapContainer{
  width: 100%;
  height: 950px;
  position: absolute;
  top: 0;
  left: 0;

}
</style>
