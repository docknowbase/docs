import Treemap from "../treemap";
import Cluster from "./cluster";
import Force from "./force";
import Pack from "./pack";
import Partition from "./partition";
import Stack from "./stack";
import Tree from "./tree";

export default () => {
  return (
    <>
      <Cluster />
      <Force />
      <Pack />
      <Partition />
      <Stack />
      <Tree />
      <Treemap />
    </>
  );
};
