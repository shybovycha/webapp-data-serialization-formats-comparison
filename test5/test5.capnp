@0x973d45fbc9cfaa0c;

struct TimeframeValues {
    category1 @0 :Float32;
    category2 @1 :Float32;
    category3 @2 :Float32;
}

struct Timeframe {
    timestamp @0 :Int32;
    values @1 :TimeframeValues;
}

struct TimeframeData {
    dataPoints @0 :List(Timeframe);
}
