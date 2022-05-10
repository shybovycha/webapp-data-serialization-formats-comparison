enum PetKind {
    CAT = 1
    DOG = 2
}

struct Pet {
    1: required string name
    2: required PetKind kind
}