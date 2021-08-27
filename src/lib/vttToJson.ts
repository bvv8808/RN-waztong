type VTT = {
  startTime: number;
  endTime: number;
  text: string;
};

export default (str: string): VTT[] => {
  let startTime = '';
  try {
    // console.log(`str:: `, str);
    const arr = str.split('\n\n');
    // console.log(`time::: `, str);

    const converted = arr.slice(0).map((a, i) => {
      const splitted = a.split('\n');
      let time = '';
      let text = '';
      if (splitted.length === 1) {
        time = splitted[0];
        text = '';
      } else if (splitted.length === 3) {
        time = splitted[1];
        text = splitted[2];
      } else {
        time = splitted[0];
        text = splitted[1];
      }
      const [start, end] = time
        .split(' --> ')
        .map(sp =>
          sp
            .split(':')
            .reduce((acc, t, i) => acc + Number(t) * Math.pow(60, 2 - i), 0),
        );
      return {
        startTime: start,
        endTime: end,
        text,
      };
    });
    //   const splitted = ;

    //   console.log(`splitted::: `, splitted);

    return converted;
  } catch (e) {
    console.log(`Error!! \n`, e, startTime.length);
    return [];
  }
};
