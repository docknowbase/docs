import Easing from "./easing";
import Enter from "./enter";
import Exit from "./exit";
import Interpolation from "./interpolation";
import Linear from "./linear";
import UpdateTransition from "./update-transition";

export default () => {
  return (
    <>
      <Linear />
      <Easing />
      <Interpolation />
      <Enter />
      <Exit />
      <UpdateTransition />
    </>
  );
};
