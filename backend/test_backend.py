from solution import (
    get_impact_for_recipe,
    get_closest_food_class_with_impact,
    get_impact_for_ingredient,
    fuzzy_match_food_name,
)
from decimal import Decimal

test_food_classes = [
    {"ID": "50", "Name": "Mascarpone", "Impact / kg": "", "Parent ID": "51"},
    {"ID": "19", "Name": "Leaves", "Impact / kg": "4.161051102", "Parent ID": "10"},
    {"ID": "16", "Name": "Garlic", "Impact / kg": "4.436081072", "Parent ID": "13"},
    {"ID": "17", "Name": "Black Sesame Seeds", "Impact / kg": "", "Parent ID": "18"},
    {"ID": "18", "Name": "Sesame Seeds", "Impact / kg": "", "Parent ID": "69"},
    {"ID": "69", "Name": "Seeds", "Impact / kg": "0.5706210838", "Parent ID": "70"},
    {"ID": "60", "Name": "Hot Drinks", "Impact / kg": "", "Parent ID": ""},
    {"ID": "51", "Name": "Dairy", "Impact / kg": "2.5", "Parent ID": ""},
]

class TestFuzzyMatchFoodName:
    def test_exact_match(self):
        assert fuzzy_match_food_name('Garlic', 'Garlic') == True

    def test_partial_match(self):
        assert fuzzy_match_food_name('Garlic', 'Gar') == False

    def test_multiple_words_same_order(self):
        assert fuzzy_match_food_name('Garlic Bread', 'Garlic Bread') == True

    def test_multiple_words_no_match(self):
        assert fuzzy_match_food_name('Garlic Bread', 'Onion Soup') == False

    def test_punctuation_no_match(self):
        assert fuzzy_match_food_name('Garlic, Bread', 'Onion, Soup') == False

    def test_multiple_words_different_order(self):
        assert fuzzy_match_food_name('Red Wine', 'Wine Red') == True

    def test_punctuation_same_order(self):
        assert fuzzy_match_food_name('Bread, Garlic', 'Bread (Garlic)') == True

    def test_punctuation_different_order(self):
        assert fuzzy_match_food_name('Garlic, Bread', 'Bread (Garlic)') == True

    def test_case_insensitivity(self):
        assert fuzzy_match_food_name('Garlic', 'GARLIC') == True

    def test_case_insensitivity_with_multiple_words(self):
        assert fuzzy_match_food_name('Garlic Bread', 'BREAD GARLIC') == True

class TestGetClosestFoodClassWithImpact:
    def test_food_class_with_non_empty_impact(self):
        food_class = get_closest_food_class_with_impact("Garlic", test_food_classes)
        assert food_class == {
            "ID": "16",
            "Name": "Garlic",
            "Impact / kg": "4.436081072",
            "Parent ID": "13",
        }

    def test_food_class_with_empty_impact_and_parent_with_non_empty_impact(self):
        food_class = get_closest_food_class_with_impact("Mascarpone", test_food_classes)
        assert food_class == {
            "ID": "51",
            "Name": "Dairy",
            "Impact / kg": "2.5",
            "Parent ID": "",
        }

    def test_food_class_with_empty_impact_and_grandparent_with_non_empty_impact(self):
        food_class = get_closest_food_class_with_impact(
            "Black Sesame Seeds", test_food_classes
        )
        assert food_class == {
            "ID": "69",
            "Name": "Seeds",
            "Impact / kg": "0.5706210838",
            "Parent ID": "70",
        }

    def test_food_class_with_empty_impact_and_no_parent_with_non_empty_impact(self):
        food_class = get_closest_food_class_with_impact("Hot Drinks", test_food_classes)
        assert food_class is None

    def test_food_class_with_empty_impact_and_parent_with_empty_impact(self):
        food_class = get_closest_food_class_with_impact("Hot Drinks", test_food_classes)
        assert food_class is None

    def test_non_existent_food_class(self):
        food_class = get_closest_food_class_with_impact(
            "Non-existent Food", test_food_classes
        )
        assert food_class is None


class TestGetImpactForIngredient:
    def test_ingredient_with_non_empty_impact(self):
        recipe_row = {
            "Recipe ID": "1",
            "Recipe Name": "Spaghetti Bolognese",
            "Ingredient Name": "Garlic",
            "Ingredient Weight / kg": "0.01",
        }
        assert get_impact_for_ingredient(recipe_row, test_food_classes) == Decimal("0.04436081072")

    def test_ingredient_with_non_existent_food(self):
        recipe_row = {
            "Recipe ID": "1",
            "Recipe Name": "Unicorn Rainbow Cake",
            "Ingredient Name": "Non-existent Food",
            "Ingredient Weight / kg": "0.01",
        }
        assert get_impact_for_ingredient(recipe_row, test_food_classes) is None


class TestGetImpactForRecipe:
    def test_food_class_cannot_be_matched(self):
        recipe_with_food_not_in_food_classes = [
            {
                "Recipe ID": "1",
                "Recipe Name": "Unicorn Rainbow Cake",
                "Ingredient Name": "Unicorn Tears",
                "Ingredient Weight / kg": "0.01",
            },
            {
                "Recipe ID": "1",
                "Recipe Name": "Unicorn Rainbow Cake",
                "Ingredient Name": "Rainbow Sprinkles",
                "Ingredient Weight / kg": "0.2",
            },
            {
                "Recipe ID": "1",
                "Recipe Name": "Unicorn Rainbow Cake",
                "Ingredient Name": "Magical Flour",
                "Ingredient Weight / kg": "0.5",
            },
            {
                "Recipe ID": "1",
                "Recipe Name": "Unicorn Rainbow Cake",
                "Ingredient Name": "Fairy Dust",
                "Ingredient Weight / kg": "0.05",
            },
        ]
        assert (
            get_impact_for_recipe(
                recipe_with_food_not_in_food_classes, test_food_classes
            )
            is None
        )

    def test_simple_garlic_seeds_recipe(self):
        recipe_with_food_not_in_food_classes = [
            {
                "Recipe ID": "1",
                "Recipe Name": "Garlic Seeds",
                "Ingredient Name": "Garlic",
                "Ingredient Weight / kg": "0.01",
            },
            {
                "Recipe ID": "1",
                "Recipe Name": "Garlic Seeds",
                "Ingredient Name": "Black Sesame Seeds",
                "Ingredient Weight / kg": "0.2",
            },
        ]
        assert (
            get_impact_for_recipe(
                recipe_with_food_not_in_food_classes, test_food_classes
            )
            == Decimal('0.15848502748')
        )

