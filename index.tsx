import Bar from "./bar";
import Histogram from "./histogram";
import SmoothLine from "./smooth-line";
import Pie from "./pie";
import Lines from "./lines";
import Scatter from "./scatter";
import Axes from "./axes";
import Area from "./area";
import Radar from "./radar";
import BubbleChart from "./bubble";
import "./index.scss";
import Radar2 from "./radar2";
import Donut from "../ChartElementsNFX/donut";
import Pie2 from "./pie2";
import StackedBarChart from "./stacked-bar";
import Heatmap from "./heatmap";
import TreeMap from "./treemap";
import Chord from "./chord";
import SunburstChart from "./sunburst";
import SankeyDiagram from "./sankey";
import Streamgraph from "./streamgraph";
import StackedAreaChart from "./stacked-area";
import BoxPlot from "./box-plot";
import Gauge from "./gauge";
import ViolinPlot from "./violin";
import FunnelChart from "./funnel";
import NetworkGraph from "./network";
import CandlestickChart from "./candlestick";
import LinearAxis from "./linear-axis";
import TimeAxis from "./timeaxis";
import LogAxis from "./logarithmic-axis";
import BandAxis from "./band-scale";
import OrdinalAxis from "./ordinal-scale";
import ColorScale from "./color-scale";
import * as d3 from "d3";
import HoverState from "./hover-state";
import ClickEvent from "./click-event";
import DragBehaviour from "./drag-behaviour";
import Zoom from "./zoom";
import Pan from "./pan";
import BrushSelection from "./brush-selection";
import Tooltip from "./tooltip";
import Motion from "./motion";
import Containers from "./containers";
import Layouts from "./layouts";

export default () => {
  return (
    <>
      <Layouts />
      <Containers />
      <Motion />
      <Axes />
      <Area />
      <Bar />
      <Histogram />
      <Lines />
      <Pie />
      <Radar />
      <Scatter />
      <SmoothLine />
      <BubbleChart />
      <Radar2 />
      <Donut />
      <Pie2 />
      <StackedBarChart />
      <Heatmap />
      <TreeMap />
      <Chord />
      <SunburstChart />
      <SankeyDiagram />
      <Streamgraph />
      <StackedAreaChart />
      <BoxPlot />
      <Gauge />
      <ViolinPlot />
      <FunnelChart />
      <NetworkGraph />
      <CandlestickChart />
      <LinearAxis />
      <TimeAxis
        width={600}
        height={60}
        startDate={new Date(2024, 0, 1)} // January 1, 2024
        endDate={new Date(2024, 11, 31)} // December 31, 2024
      />
      <LogAxis
        width={600}
        height={60}
        domain={[1, 1000000]} // Range from 1 to 1M
        base={10} // Base-10 logarithm
      />
      <BandAxis
        width={600}
        height={80}
        data={[
          "Category A",
          "Category B",
          "Category C",
          "Category D",
          "Category E",
        ]}
        padding={0.2}
        alignment="center"
      />
      <OrdinalAxis
        width={600}
        height={80}
        data={["Low", "Medium", "High"]}
        colors={["#ff9999", "#99ff99", "#9999ff"]}
        showColorBlocks={true}
      />

      <>
        // Sequential scale
        <ColorScale
          type="sequential"
          domain={[0, 100]}
          colors={{
            sequential: ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"],
            diverging: ["#2166ac", "#92c5de", "#f7f7f7", "#f4a582", "#b2182b"],
            categorical: d3.schemeCategory10,
          }}
        />
        // Diverging scale
        <ColorScale type="diverging" domain={[-50, 50]} />
        // Categorical scale
        <ColorScale type="categorical" domain={["A", "B", "C", "D", "E"]} />
      </>
      <HoverState />
      <ClickEvent />
      <DragBehaviour />
      <Zoom />
      <Pan />
      <BrushSelection />
      <Tooltip />
    </>
  );
};
