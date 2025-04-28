
<template>
  <div id="mapContainer"></div>
</template>
<script setup lang="ts">
import AMapLoader from "@amap/amap-jsapi-loader";
import { onUnmounted, onMounted, ref } from "vue";
import { GetFoodMapList } from "./config";
let map = null;
const currentPosition = ref({});
let indexCluster; //聚合点实例
onMounted(() => {
  //注意在高德地图上注册的web服务端和web端是两个
  window._AMapSecurityConfig = {
    securityJsCode: "b93f8466e3cbf4b982065dc394eff857",
  };
  initMap();
});
const initMap = () => {
  AMapLoader.load({
    key: "1ab83a26a29e05812d5fb5e347fb279a",
    version: "2.0", // 推荐 2.0 版本
    plugins: [
      "AMap.Scale",
      "AMap.ToolBar",
      "AMap.Geolocation",
      "AMap.Marker",
      "AMap.IndexCluster",
    ],
    Loca: {
      version: "2.0.0",
    },
  })
    .then((AMap) => {
      map = new AMap.Map("mapContainer", {
        zoom: 11,
        center: [118.608045, 32.055255],
        viewMode: "3D", 
        animateEnable: true,
        // mapStyle: "amap://styles/grey",
        resizeEnable: true, // 自适应窗口
      });
      // 初始化定位插件
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true, // 高精度定位
        timeout: 5000, // 超时时间
        buttonPosition: "RB", // 定位按钮位置（右下）
      });

      map.addControl(geolocation);
      // 定位成功回调
      geolocation.getCurrentPosition((status, result) => {
        if (status === "complete") {
          currentPosition.value = {
            lng: result.position.lng,
            lat: result.position.lat,
            address: result.formattedAddress,
          };
          map.setCenter([result.position.lng, result.position.lat]); // 地图中心点定位
        } else {
          console.error(" 定位失败:", result);
          //如果定位失败则根据网络区域所属位置定位

          if (status !== "complete") {
            AMap.plugin("AMap.CitySearch", () => {
              const citySearch = new AMap.CitySearch();
              citySearch.getLocalCity((status, result) => {
                if (status === "complete") {
                  // map.setCenter(result.cityinfo.center);
                  var cityinfo = result.city;
                  var citybounds = result.bounds;
                  // document.getElementById('info').innerHTML = '您当前所在城市：'+cityinfo;
                  //地图显示当前城市
                  map.setBounds(citybounds);
                }
              });
            });
          }
        }
      });

      setLabelMaker();
    })
    .catch((e) => console.error(e));
};

let clusterIndexSet = {
  //城市层级
  city: {
    minZoom: 2,
    maxZoom: 10,
  },
  district: {
    minZoom: 10,
    maxZoom: 12,
  },
  building: {
    minZoom: 12,
    maxZoom: 22,
  },
};
const {foodMapList} = GetFoodMapList(); 
let points = foodMapList; // 假设这是你的数据数组;
var district = {
  北京: {
    adcode: "110000",
    center: "116.405285,39.904989",
    // "center" : "117.939152,40.976204",
  },
  亦庄开发区: {
    center: "116.506647,39.795337",
  },
  密云区: {
    adcode: "110118",
    center: "116.843352,40.377362",
  },
  怀柔区: {
    adcode: "110116",
    center: "116.637122,40.324272",
  },
  门头沟区: {
    adcode: "110109",
    center: "116.105381,39.937183",
  },
  顺义区: {
    adcode: "110113",
    center: "116.653525,40.128936",
  },
  朝阳区: {
    adcode: "110105",
    center: "116.486409,39.921489",
  },
  通州区: {
    adcode: "110112",
    center: "116.658603,39.902486",
  },
  大兴区: {
    adcode: "110115",
    center: "116.338033,39.728908",
  },
  昌平区: {
    adcode: "110114",
    center: "116.235906,40.218085",
  },
  西城区: {
    adcode: "110102",
    center: "116.366794,39.915309",
  },
  东城区: {
    adcode: "110101",
    center: "116.418757,39.917544",
  },
  房山区: {
    adcode: "110111",
    center: "116.139157,39.735535",
  },
  石景山区: {
    adcode: "110107",
    center: "116.195445,39.914601",
  },
  海淀区: {
    adcode: "110108",
    center: "116.310316,39.956074",
  },
  丰台区: {
    center: "116.286968,39.863642",
  },
};
const setLabelMaker = () => {
  map.plugin(["AMap.IndexCluster"], function () {
    loadIndexCluster(points); // 初始加载聚合点
  });
};

function getStyle(context) {
  var clusterData = context.clusterData; // 聚合中包含数据
  var index = context.index; // 聚合的条件
  var count = context.count; // 聚合中点的总数
  var marker = context.marker; // 聚合绘制点 Marker 对象
  var color = ["8,60,156", "66,130,198", "107,174,214", "78,200,211"];
  var indexs = ["city", "district", "area", "community"];
  var i = indexs.indexOf(index["mainKey"]);
  var text = clusterData[0][index["mainKey"]];
  var size = Math.round(30 + Math.pow(count / points.length, 1 / 5) * 70);
  if (i <= 2) {
    var extra = '<span class="showCount">' + context.count + "套</span>";
    text = '<span class="showName">' + text + "</span>";
    text += extra;
  } else {
    size = 12 * text.length + 20;
  }
  var style = {
    bgColor: "rgba(" + color[i] + ",.8)",
    borderColor: "rgba(" + color[i] + ",1)",
    text: text,
    size: size,
    index: i,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: size + "px",
    boxShadow: "0px 0px 5px rgba(0,0,0,0.8)",
  };
  return style;
}
function getPosition(context) {
  var key = context.index.mainKey;
  var dataItem = context.clusterData && context.clusterData[0];
  var districtName = dataItem[key];
  if (!district[districtName]) {
    return null;
  }
  var center = district[districtName].center.split(",");
  var centerLnglat = new AMap.LngLat(center[0], center[1]);
  return centerLnglat;
}
const _renderClusterMarker = (context: any) => {
  var clusterData = context.clusterData; // 聚合中包含数据
  var index = context.index; // 聚合的条件
  var count = context.count; // 聚合中点的总数
  var marker = context.marker; // 聚合点标记对象
  var styleObj = getStyle(context);
  // 自定义点标记样式
  var div = document.createElement("div");
  div.className = "amap-cluster";
  div.style.backgroundColor = styleObj.bgColor;
  div.style.width = styleObj.size + "px";
  if (styleObj.index <= 2) {
    div.style.height = styleObj.size + "px";
    // 自定义点击事件
    context.marker.on("click", function (e) {
      console.log(e);
      var curZoom = map.getZoom();
      if (curZoom < 20) {
        curZoom += 1;
      }
      map.setZoomAndCenter(curZoom, e.lnglat);
    });
  }
  div.style.border = "solid 1px " + styleObj.borderColor;
  div.style.borderRadius = styleObj.size + "px";
  div.innerHTML = styleObj.text;
  div.style.color = styleObj.color;
  div.style.textAlign = styleObj.textAlign;
  div.style.boxShadow = styleObj.boxShadow;
  div.style.lineHeight = styleObj.lineHeight;
  context.marker.setContent(div);
  // 自定义聚合点标记显示位置
  var position = getPosition(context);
  if (position) {
    context.marker.setPosition(position);
  }
  context.marker.setAnchor("center");
};
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
  map?.destroy(); //释放内存销毁实例
});
// 待开发 
// 找10个左右具体的打点信息做测试
// 1：具体店铺的或者聚合点的气泡
// 2：地图拉开到全国看到各个省份的聚合信息，省份时候看到市的聚合信息
// 3：聚合信息在行政区域的中间
</script>
<style scoped>
#mapContainer {
  width: 100%;
  height: 50vh;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
