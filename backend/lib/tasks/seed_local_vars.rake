namespace :db do
  desc "Seed only Unreal Variables local variables"
  task seed_local_vars: :environment do
    variables = [
      '#AC25', '#AC35', '#AC5', '#AC6', '#AC71', '#ACSPLITS', '#AdjustableBench', '#Basin_Mixer',
      '#Bath', '#BlackPlastic', '#BlindAutomation', '#CeilingFan', '#Cooktops', '#CornerbarSales',
      '#DGPOUSB', '#DataPoints', '#DbarSales', '#DisabledBasins', '#DisabledShower', '#DisabledToilets',
      '#Dishwashers', '#DoorOpenerEXT', '#DoorOpenerINT', '#DoubleGPO', '#DoubleWGPO', '#DoubleSpotlights',
      '#DoubleSpotlightsSensor', '#DoubleTowelRail', '#Downlights', '#Downpipes', '#Drains', '#Drawers',
      '#ExhaustFans', '#ExtCeilingFan', '#ExtWallLights', '#ExternalDoors', '#ExternalDoorsWet',
      '#ExternalSlabs', '#Fridges', '#Garage', '#Garages', '#GasPoints', '#HRG', '#InsetBaths',
      '#IntWallLights', '#KitchenSink', '#LH1020Doors', '#LH112JAMBS', '#LH2340112JAMBS', '#LH241020Doors',
      '#LH24620Doors', '#LH24720Doors', '#LH24820Doors', '#LH24870Doors', '#LH24920Doors', '#LH24LO1020Doors',
      '#LH620Doors', '#LH720Doors', '#LH820Doors', '#LH820GarageDoors', '#LH870Doors', '#LH920Doors',
      '#LHCareKitchenSink', '#LHDoors', '#LHGrabRail', '#LHKitchenSink', '#LHLO1020Doors', '#LHLO24720Doors',
      '#LHLO24820Doors', '#LHLO24870Doors', '#LHLO24920Doors', '#LHLO720Doors', '#LHLO820Doors',
      '#LHLO870Doors', '#LHLO920Doors', '#LdyTubs', '#MeshSquaresSales', '#Microwaves', '#NDISDoubleGPO',
      '#NDISDoubleGPOUSB', '#NDISSingleGPO', '#NdisRollInRobes', '#OOARobe', '#PassageHandles',
      '#Pendants', '#Penetrations', '#PhonePoints', '#Piers', '#Posts', '#PrivacyHandles', '#RH1020Doors',
      '#RH112JAMBS', '#RH2340112JAMBS', '#RH241020Doors', '#RH24620Doors', '#RH24720Doors', '#RH24820Doors',
      '#RH24870Doors', '#RH24920Doors', '#RH620Doors', '#RH720Doors', '#RH820Doors', '#RH820GarageDoors',
      '#RH870Doors', '#RH920Doors', '#RHCareKitchenSink', '#RHDoors', '#RHGrabRail', '#RHKitchenSink',
      '#RHLO1020Doors', '#RHLO241020Doors', '#RHLO24720Doors', '#RHLO24820Doors', '#RHLO24870Doors',
      '#RHLO24920Doors', '#RHLO720Doors', '#RHLO820Doors', '#RHLO870Doors', '#RHLO920Doors', '#Rangehoods',
      '#RecessedVanityBasins', '#RobePosts', '#Robes', '#Sensors', '#ShowerRails', '#Showers',
      '#SingleGPO', '#SingleGPORoof', '#SingleWGPO', '#SingleSpotlights', '#SingleSpotlightsSensor',
      '#SinkMixer', '#SlabGroundSpacersSales', '#SmokeDetectors', '#SolarPanels', '#StandAloneTubs',
      '#TVPoints', '#TapeSlab', '#ToiletRollHolders', '#Toilets', '#TrenchMesh3TM', '#TrenchMeshSupportSales',
      '#UndermountSink', '#VanityBasins', '#WallMountedBasin', '#WallOvenCab', '#Wall_Mixer', '#Watertank',
      '#Watertank10000L', '#Watertank2000L', '#Watertank3000L', '#Watertank4000L', '#Watertank5000L',
      '#WindowActuator', '#WindowsLintels', '#WirShelves', '#WireTie', '#ZbarSales'
    ]

    puts "Seeding #{variables.length} Unreal Local Variables..."
    variables.each do |variable_name|
      UnrealVariable.find_or_create_by!(variable_name: variable_name) do |var|
        var.claude_value = 0
      end
    end
    puts "Done! Created #{UnrealVariable.count} unreal variables"
  end
end
