var dom = document.getElementById("chart-container");
var myChart = echarts.init(dom, null, {
  renderer: "canvas",
  useDirtyRect: false,
});
var app = {};
var option;
(async () => {
  const res = await fetch("./undefined-count-by-type.json");
  const undefinedTermsByCredentialType = await res.json();
  const source = undefinedTermsByCredentialType.map((ct) => {
    return [ct.type, ct.count];
  });

  option = {
    dataset: [
      {
        dimensions: ["name", "score"],
        source: source,
      },
      {
        transform: {
          type: "sort",
          config: { dimension: "score", order: "desc" },
        },
      },
    ],
    xAxis: {
      type: "category",
      triggerEvent: true,
      axisLabel: {
        interval: 0,
        rotate: 30,
        formatter: function (value) {
          console.log(value);
          const short = value.substring(0, 8) + "...";
          return short;
        },
      },
    },
    yAxis: {},
    series: {
      type: "bar",
      encode: { x: "name", y: "score" },
      itemStyle: { color: "red" },

      datasetIndex: 1,
    },
  };

  if (option && typeof option === "object") {
    myChart.setOption(option);
  }

  myChart.on("click", function (params) {
    // Make sure event from target axis
    if (params.componentType === "xAxis" && params.xAxisIndex === 0) {
      // params.value is the axis label before formatted
      const endpoint = `https://w3id.org/traceability/openapi/components/schemas/credentials/${params.value}.yml`;
      window.open(endpoint, "_blank");
    }
  });

  window.addEventListener("resize", myChart.resize);
})();
