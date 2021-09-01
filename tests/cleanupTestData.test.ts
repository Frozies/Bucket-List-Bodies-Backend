//TODO: Take a list of all of the mutations & failed mutations sent to stripe, the database, and cloudinary and purge it. :)

/** This is the delete meal query to be used later.
 * */
/*
* const DELETE_MEAL = gql`
                mutation UpdateMealMutation($deleteMealMeal: deleteMealInput) {
                    deleteMeal(meal: $deleteMealMeal)
                }
            `;

            it('Successfully delete meal', async () => {
                const result = await mockDB.executeOperation({
                    query: DELETE_MEAL,
                    variables: {
                        "deleteMealMeal": {
                            productID: testProductID,
                        }
                    }
                });
                if (result.errors != undefined) console.log(result.errors);
                expect(result.errors).to.undefined;

                expect(result.data.deleteMeal).to.equal("Deleted: " + testProductID)
            });
* */