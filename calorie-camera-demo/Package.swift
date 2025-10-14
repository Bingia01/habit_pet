// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "CalorieCameraDemo",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .executable(
            name: "CalorieCameraDemoApp",
            targets: ["CalorieCameraDemoApp"]
        )
    ],
    dependencies: [
        .package(path: "../calorie-camera")
    ],
    targets: [
        .executableTarget(
            name: "CalorieCameraDemoApp",
            dependencies: [
                .product(name: "CalorieCameraKit", package: "calorie-camera")
            ],
            path: ".",
            exclude: [
                "README.md"
            ],
            sources: [
                "App"
            ],
            resources: [
                .process("Config")
            ]
        )
    ]
)
