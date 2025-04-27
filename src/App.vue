
<template>
     <div id="mapContainer"></div>
</template>
<script setup lang="ts">
import AMapLoader from '@amap/amap-jsapi-loader';
import { onUnmounted, onMounted, ref } from 'vue';
import { GetFoodMapList } from './config'
const map = ref(null as any);
const currentPosition = ref({});
let indexCluster; //聚合点实例
onMounted(() => {
  //注意在高德地图上注册的web服务端和web端是两个
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
      timeout: 5000, // 超时时间 
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
        //如果定位失败则根据网络区域所属位置定位

        if (status !== 'complete') {
          AMap.plugin('AMap.CitySearch',  () => {
            const citySearch = new AMap.CitySearch();
              citySearch.getLocalCity((status,  result) => {
                if (status === 'complete') {
                  // map.value.setCenter(result.cityinfo.center); 
                  var cityinfo = result.city;
                    var citybounds = result.bounds;
                    // document.getElementById('info').innerHTML = '您当前所在城市：'+cityinfo;
                    //地图显示当前城市
                    map.value.setBounds(citybounds);
                }
              });
            });
          }

      }
    });
   
    setLabelMaker();
  }).catch(e => console.error(e)); 
}
const setLabelMaker = ()=>{
    map.value.plugin(["AMap.IndexCluster"], function() {
					loadIndexCluster([]); // 初始加载聚合点
				});

  
      var markers = [];
      var allowCollision = false;
      var layer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        // collision: false,
        // 设置 allowCollision：true，可以让标注避让用户的标注
        allowCollision,
      });
      layer.add(markers);
      // 图层添加到地图
      map.value.add(layer);
    const { foodMapList }  = GetFoodMapList();

      // 初始化 labelMarker
      for (var i = 0; i < foodMapList.length; i++) {
        var curData = foodMapList[i];
        curData.extData = {
          index: i,
        };

        var labelMarker = new AMap.LabelMarker(curData);

        markers.push(labelMarker);
      }
      // 将 marker 添加到图层
      layer.add(markers);
      map.value.setFitView();  // 自适

     let clusterIndexSet = {
      //城市层级
      city:{
        minZoom:2,
        maxZoom:10,
      },
      district:{
        minZoom:10,
        maxZoom:12,
      },
      building:{
        minZoom:12,
        maxZoom:22,
      }
     }
}
const _renderClusterMarker = (context:any)=>{
  let clusterCount = context.count;//聚合点内数量
  let clusterData = context.clusterData;//聚合点数组
  let mainKey = context.index.mainKey;//聚合点对应索引

  let constData = clusterData[0][mainKey]//当前层级（市/区）展示名
  
  //构建聚合点的显示内容
  let content;
  if (mainKey == "city") {
            //城市样式
			content = `
		    <div>
		      ${constData}<br>
		      ${clusterCount > 1 ? clusterCount : ""}${clusterCount > 1 ? "家" : ""}
		    </div>`;
		} else if (mainKey == "district") {
            //区样式
			content = `
			  <div>
			    ${constData}<br>
			    ${clusterCount > 1 ? clusterCount : "1"}${clusterCount > 1 ? "家" : ""}
			  </div>`;
		} else {
            //区样式
			let name = clusterData[0].entName || clusterData[0].name;
 
			content = `
			  <div style="position: relative;">
			    <img style="width:20px; height: 24px;" src="" alt="" />
			    <div>${name}</div>
			  </div>`;
		}
// 自定义点击事件
context.marker.on("click", function(e) {
			// touchend 移动端点击事件；mouseup pc点击
			let clickType = e.originEvent.type;
 
			// 兼容pc端、移动端判断
			if (clickType == "touchend" && getDeviceType() == "Mobile") {
				// 移动端
				if (clusterData.length != 0 && mainKey == "building") {
					setTimeout(() => {
						// emits('pointsClick', clusterData)//向父组件传递点位信息
					}, 100)
				}
			} else if (clickType == "mouseup" && getDeviceType() == "Desktop") {
				// pc端
				setTimeout(() => {
					// emits('pointsClick', clusterData)//向父组件传递点位信息
				}, 100)
			}
		});
 
		context.marker.setContent(content);
}
// 聚合点图层热更新调用
const loadIndexCluster = (newPoints) => {
		if (indexCluster) {
			// 销毁现有的 IndexCluster 实例
			indexCluster.setMap(null);
			indexCluster = null;
		}
 
		indexCluster = new AMap.IndexCluster(map, newPoints, {
			renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
			clusterIndexSet: clusterIndexSet, // 聚合规则
		});
	};
 
    // 判断当前设备类型
	function getDeviceType() {
		const userAgent = navigator.userAgent;
 
		// 判断是否是移动设备（手机或平板）
		if (
			/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				userAgent
			)
		) {
			return "Mobile";
		}
 
		// 默认是电脑
		return "Desktop";
	}
//  https://blog.csdn.net/2302_78685420/article/details/144710759
  onUnmounted(() => {
    map.value?.destroy();//释放内存销毁实例
  });

</script>
<style scoped>

#mapContainer{
  width: 100%;
  height: 50vh;
  position: absolute;
  top: 0;
  left: 0;

}
</style>
