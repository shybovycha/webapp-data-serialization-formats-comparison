struct TimeframeValues {
    1: required double category1;
    2: required double category2;
    3: required double category3;
}

struct Timeframe {
    1: required i32 timestamp;
    2: required TimeframeValues values;
}

struct TimeframeData {
    1: required list<Timeframe> dataPoints;
}
